import { useEffect, useState, useMemo } from "react";
import { fromSeed, shuffle } from "./rng";
const update = new Event("update");

/**
 * @param target: EventTarget
 */
export function useEvent(target, type, callback, deps) {
  useEffect(function() {
    if (!target) return;
    if (!type) return;

    target.addEventListener(type, callback);
    return function() {
      target.removeEventListener(type, callback);
    };
  }, deps);
}

class AdhocEventTarget extends EventTarget {
  id = Math.random()
    .toString(16)
    .slice(-8);
  update() {
    this.dispatchEvent(update);
  }

  useUpdateEffect(cb) {
    useEvent(this, "update", cb, [this]);
  }

  useUpdate() {
    const [i, inc] = useState(0);
    const cb = useMemo(
      function() {
        let j = i;
        return () => inc(++j);
      },
      [inc]
    );

    this.useUpdateEffect(cb);
  }
}

export class Game extends AdhocEventTarget {
  rng = fromSeed();
  ingredients = new Deck(this.rng);
  flavors = new Deck(this.rng);
  customers = new Deck(this.rng);
  players = [];
  localPlayer = 0;

  constructor(n) {
    super();
    for (let i = 0; i < n; i++) {
      this.players.push(new Player());
      this.players[i].name = "player-" + (i + 1);
    }
  }

  init(rng, ingredients, flavors, customers) {
    this.rng = rng;
    this.ingredients.init(rng, ingredients);
    this.flavors.init(rng, flavors);
    this.customers.init(rng, customers);
    this.players.forEach(p => p.init());
  }
}

class Player extends AdhocEventTarget {
  bowls = [new Bowl(), new Bowl(), new Bowl()];
  hand = [];
  specialFlavors = [];
  customers = [];

  name = this.id;

  init() {
    this.bowls.forEach(bowl => bowl.init());
    this.hand.length = 0;
    this.specialFlavors.length = 0;
    this.customers.length = 0;
  }

  totalScore() {
    return (
      this.bowls.map(bowl => bowl.totalScore()).reduce((a, b) => a + b, 0) +
      this.customers.reduce((a, b) => a + b, 0)
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
    const name = this.name;
    const score = "￥" + this.totalScore();
    const stats = this.bowls.map(bowl => bowl.ingredients);
    return { avatar, name, score, stats, key: this.id };
  }
}

class Bowl extends AdhocEventTarget {
  flavor = null;
  ingredients = [];
  rules = [];

  init() {
    this.flavor = null;
    this.ingredients.length = 0;
    this.rules.length = 0;
  }

  totalScore() {
    return this.rules
      .map(r => r(this.ingredients).score || 0)
      .reduce((a, b) => a + b, 0);
  }

  setFlavor(flavor, basicRules) {
    this.flavor = flavor;
    this.rules = [...flavor.rules, ...basicRules];
  }

  renderProps() {
    const order = this.flavor || this.flavor.name;
    const ingredients = this.ingredients;
    const score = this.totalScore();
    return {
      order,
      ingredients,
      score,
      key: this.id
    };
  }
}

class Deck extends AdhocEventTarget {
  drawlist = [];
  discardlist = [];
  zonelist = [];

  constructor(rng) {
    super();
    this.rng = rng;
  }

  init(rng, content) {
    content = content || [];
    this.rng = rng;
    this.drawlist = content.slice();
    this.discardlist.length = 0;
    this.zonelist.length = 0;
    shuffle(this.drawlist, this.rng);
  }

  deal(n, to) {
    to = to || this.zonelist;
    if (this.drawlist.length < n) {
      shuffle(this.discardlist, this.rng);
      this.drawlist = this.discardlist.concat(this.drawlist);
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
    this.discardlist.push(target);
  }

  renderProps() {
    return {
      drawSize: this.drawlist.length,
      discardSize: this.discardlist.length,
      zone: this.zonelist,
      key: this.id
    };
  }
}
