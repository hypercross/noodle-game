import { shuffle, dice } from "./rng";
import { AdhocEventTarget } from "./event";

export class Game extends AdhocEventTarget {
  getLocalPlayer() {
    return this.players[this.localPlayer];
  }

  fromParams() {
    const [rng, n, localPlayer, ingredients, flavors, bargain, customers, actions] = this.params;
    this.rng = rng;

    this.players = [];
    while (this.players.length < n)
      this.players.push(new Player(`player-${this.players.length}`));
    this.players.length = n;
    this.players.forEach(p => p.fromParams());

    this.localPlayer = localPlayer;

    this.ingredients = new Deck(rng, ingredients);
    this.flavors = new Deck(rng, flavors);
    this.bargain = bargain;
    this.customers = new Deck(rng, customers);

    this.actions = actions;
    this.drawTarget = new DrawTarget(this.ingredients);
  }
}

class DrawTarget extends AdhocEventTarget {
  fromParams(){
    const [deck] = this.params;
    this.deck = deck;
  }
  renderProps() {
    const { drawSize, discardSize } = this.deck.renderProps();
    return {
      key: 'draw',
      className: 'xxs pile',
      name: '抽卡',
      type: discardSize + drawSize,
    }
  }
}

export class Player extends AdhocEventTarget {

  fromParams() {
    const [name] = this.params;
    this.name = name || this.id;
    this.bowls = [new Bowl(), new Bowl(), new Bowl()];
    this.hand = [];
    this.specialFlavors = [];
    this.customers = [];
    this.actions = 0;
  }

  totalScore() {
    return (
      this.bowls.map(bowl => bowl.totalScore()).reduce((a, b) => a + b, 0) +
      this.customers.map(c => c.score).reduce((a, b) => a + b, 0)
    );
  }

  addIngredient(bowl, ...ings) {
    for (const ing of ings) {
      const i = this.hand.indexOf(ing);
      if (i < 0) {
        throw new Error("I dont have this ingredient!");
      }
    }
    if (bowl.ingredients.length + ings.length > 5) {
      throw new Error("too many ingredients!");
    }
    for (const ing of ings) {
      const i = this.hand.indexOf(ing);
      this.hand.splice(i, 1);
    }

    bowl.ingredients.push(...ings);
  }

  renderProps() {
    const avatar = `//robohash.org/${this.name}?set=set4&size=80x80`;
    const score = "￥" + this.totalScore();
    const stats = this.bowls.map(bowl => bowl.ingredients);
    const { name, actions } = this;
    const customers = this.customers.length;
    return { avatar, name, score, stats, actions, customers, key: this.id };
  }
}

export class Bowl extends AdhocEventTarget {
  fromParams() {
    const [rules, ingredients, flavor] = this.params;
    this.flavor = flavor;
    this.ingredients = ingredients || [];
    this.rules = rules || [];
  }

  totalScore() {
    return this.rules
      .map(r => r(this.ingredients).score || 0)
      .reduce((a, b) => a + b, 0);
  }

  setFlavor(flavor, basicRules) {
    this.flavor = flavor;
    this.rules = [...flavor.rules, ...(basicRules || [])];
  }

  renderProps() {
    const flavor = this.flavor && this.flavor.name;
    const ingredients = this.ingredients;
    const score = this.totalScore();
    return {
      flavor,
      ingredients,
      score,
      key: this.id
    };
  }
}

export class Deck extends AdhocEventTarget {
  fromParams() {
    const [rng, content] = this.params;
    this.rng = rng;

    this.drawlist = content.slice();
    this.discardlist = [];
    this.zonelist = [];
  }

  available(){
    return this.drawlist.length + this.discardlist.length;
  }

  deal(n, to) {
    to = to || this.zonelist;
    if (this.drawlist.length < n) {
      shuffle(this.discardlist, this.rng);
      this.drawlist = this.discardlist.concat(this.drawlist);
      this.discardlist = [];
    }
    const start = Math.max(0, this.drawlist.length - n);
    const drawn = this.drawlist.splice(start, n);
    to.push(...drawn);
    return drawn.length;
  }

  discard(target, to) {
    to = to || this.discardlist;
    const zi = this.zonelist.indexOf(target);
    if (zi < 0) return;

    this.zonelist.splice(zi, 1);
    to.push(target);
  }

  renderProps() {
    return {
      drawSize: this.drawlist.length,
      discardSize: this.discardlist.length,
      zone: this.zonelist,
      key: this.id
    };
  }

  shuffle() {
    shuffle(this.drawlist, this.rng);
  }
}

export class Ingredient extends AdhocEventTarget {
  fromParams() {
    const [name, type, isSeafood] = this.params;
    this.name = name;
    this.type = type;
    this.isSeafood = isSeafood;
  }
  renderProps() {
    const { name, type, isSeafood } = this;
    return { name, type, isSeafood, key: this.id };
  }
}

export class Flavor extends AdhocEventTarget {
  static defaultConfig() {
    return {
      name: "点单",
      tiers: [
        { count: 5, score: 13, tier: "大份" },
        { count: 1, score: 8, tier: "小份" }
      ],
      required: [],
      recommended: [],
      prohibited: []
    };
  }

  fromParams() {
    const {
      name, tiers, required, recommended, prohibited
    } = this.params[0];
    this.name = name;
    this.tiers = tiers;
    this.required = required;
    this.recommended = recommended;
    this.prohibited = prohibited;
  }

  renderProps() {
    const name = this.name;
    const scores = this.tiers.map(t => '￥' + t.score).join(', ');
    const recipe = {
      required: this.required.map(r => r.label),
      recommended: this.recommended.map(r => r.label),
      prohibited: this.prohibited.map(r => r.label),
    }
    return { name, scores, recipe, key: this.id };
  }

  findMatch(ings, required) {
    const names = {};
    const matched = ings.filter(ing => {
      if (names[ing.name]) return false;
      names[ing.name] = true;
      return true;
    });

    for (const req of required) {
      const i = matched.findIndex(req.match);
      if (i < 0) return false;

      matched.splice(i, 1);
    }

    return true;
  }

  orderRule = ings => {
    if (!this.findMatch(ings, this.required)) return {};
    for (const tier of this.tiers) {
      if (ings.length >= tier.count) {
        return {
          type: "ok",
          score: tier.score,
          message: `${this.name}·${tier.tier}`
        };
      }
    }
    return {};
  };

  recommendedRule = ings => {
    if (!this.findMatch(ings, this.required)) return {};
    let score = 0;
    const msgs = [];

    for (const r of this.recommended) {
      if (this.findMatch(ings, [r])) {
        msgs.push(r.label);
        score += r.score;
      }
    }

    return score != 0
      ? { type: "recommended", message: msgs.join(", "), score }
      : {};
  };

  prohibitedRule = ings => {
    if (!this.findMatch(ings, this.required)) return {};
    let score = 0;
    const msgs = [];

    for (const r of this.prohibited) {
      if (this.findMatch(ings, [r])) {
        msgs.push(r.label);
        score += r.score;
      }
    }

    return score != 0
      ? { type: "prohibited", message: msgs.join(", "), score }
      : {};
  };

  rules = [this.orderRule, this.recommendedRule, this.prohibitedRule];
}

export class Customer extends AdhocEventTarget {
  fromParams() {
    const [
      name,
      score,
      rule,
      total,
      used,
    ] = this.params;

    this.name = name;
    this.score = score;
    this.rule = rule;
    this.total = total || 3;
    this.used = used || 2;
  }

  setScoreFromDice(rng) {
    const scores = [];
    for (let i = 0; i < this.total; i++) {
      scores.push(dice(6, rng));
    }
    scores.sort((a, b) => b - a);
    scores.length = Math.min(scores.length, this.used);
    this.score = scores.reduce((a, b) => a + b, 0);
  }

  renderProps() {
    const key = this.id;
    const name = this.name;
    const score = this.score;
    return { name, score, key };
  }

  topPlayer(players) {
    const scores = players.map(this.rule);
    const top = scores.reduce((a, b) => Math.max(a, b), 0);
    const topPlayers = [];
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] != top) continue;

      topPlayers.push(players[i]);
    }

    if (topPlayers.length == 1) {
      return topPlayers[0];
    }

    return null;
  }
}
