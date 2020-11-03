import { dice } from "./rng";

export const catalog = [
  { type: "肉", name: "墨鱼" },
  { type: "肉", name: "花甲" },
  { type: "肉", name: "牛肉" },
  { type: "肉", name: "排骨" },
  { type: "肉", name: "臊子" },
  { type: "肉", name: "煎蛋" },
  { type: "肉", name: "虾" },
  { type: "肉", name: "肥肠" },

  { type: "菜", name: "软浆叶" },
  { type: "菜", name: "香菇" },
  { type: "菜", name: "番茄" },
  { type: "菜", name: "豌豆尖" },
  { type: "菜", name: "飘儿白" },
  { type: "菜", name: "芹菜" },

  { type: "佐料", name: "红油" },
  { type: "佐料", name: "盐须" },
  { type: "佐料", name: "葱花" }
];

function makeTypeRule(type, score) {
  return ings => {
    return ings.find(n => n.type == type)
      ? {
          type: "ok",
          message: "有" + type,
          score
        }
      : {};
  };
}

export const basicRules = [
  makeTypeRule("肉", 3),
  makeTypeRule("菜", 2),
  makeTypeRule("佐料", 1),
  ings => {
    let score = 0;
    const names = {};
    for (const ing of ings) {
      names[ing.name] = (names[ing.name] || 0) + 1;
    }
    const msgs = [];
    for (const ing of Object.keys(names)) {
      let n = names[ing];
      while (n >= 3) {
        msgs.push(`${ing} x 3`);
        score += 5;
        n -= 3;
      }
      while (n >= 2) {
        msgs.push(`${ing} x 2`);
        score += 2;
        n -= 3;
      }
    }
    return {
      score,
      type: score > 0 ? "ok" : null,
      message: msgs.join(", ")
    };
  }
];

class NoodleFlavor {
  name = "点单";
  tiers = [
    { count: 5, score: 13, tier: "大份" },
    { count: 1, score: 8, tier: "小份" }
  ];
  required = [];
  recommended = [];
  prohibited = [];

  renderProps() {
    return {
      name: this.name,
      scores: this.tiers.map(t => `￥${t.score}`).join("|")
    };
  }

  findMatch(ings, required) {
    const names = {};
    const matched = ings.filter(ing => {
      if (names[ing.name]) return false;
      names[ing.name] = true;
      return true;
    });

    for (const req of required) {
      const i = matched.findIndex(req);
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
        msgs.push(`${r.name}`);
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
        msgs.push(`${r.name}`);
        score += r.score;
      }
    }

    return score != 0
      ? { type: "prohibited", message: msgs.join(", "), score }
      : {};
  };

  rules = [this.orderRule, this.recommendedRule, this.prohibitedRule];
}

function buildMatcher(name, score, cb) {
  Object.defineProperties(cb, {
    name: {
      get() {
        return name;
      }
    },
    score: {
      get() {
        return score;
      }
    }
  });
  return cb;
}

const 葱花推荐 = buildMatcher("葱花推荐", 2, ing => ing.name == "葱花");
const 葱花禁选 = buildMatcher("葱花禁选", -3, ing => ing.name == "葱花");

const 盐须推荐 = buildMatcher("盐须推荐", 2, ing => ing.name == "盐须");
const 盐须禁选 = buildMatcher("盐须禁选", -3, ing => ing.name == "盐须");

const 红油推荐 = buildMatcher("红油推荐", 2, ing => ing.name == "红油");
const 红油禁选 = buildMatcher("红油禁选", -3, ing => ing.name == "红油");

const seafood = {
  墨鱼: true,
  花甲: true,
  虾: true
};

function 海鲜(ing) {
  return ing.type == "肉" && !!seafood[ing.name];
}

function named(name) {
  return ing => ing.name == name;
}

function typed(type) {
  return ing => ing.type == type;
}
const n0 = new NoodleFlavor();
n0.name = "特价面";
n0.tiers = [{ count: 1, tier: "折扣", score: 0 }];

const n1 = new NoodleFlavor();
n1.name = "番茄煎蛋面";
n1.required.push(named("番茄"), named("煎蛋"));
n1.recommended.push(葱花推荐);
n1.prohibited.push(红油禁选);

const n2 = new NoodleFlavor();
n2.name = "红烧排骨面";
n2.required.push(named("排骨"), named("红油"));
n2.recommended.push(葱花推荐);
n2.prohibited.push(盐须禁选);

const n3 = new NoodleFlavor();
n3.name = "红烧牛肉面";
n3.required.push(named("牛肉"), named("红油"));
n3.recommended.push(盐须推荐);

const n4 = new NoodleFlavor();
n4.name = "海鲜面";
n4.required.push(海鲜, 海鲜);
n4.prohibited.push(红油禁选);

const n5 = new NoodleFlavor();
n5.name = "脆绍面";
n5.required.push(named("红油"), named("臊子"));
n5.recommended.push(葱花推荐);

const n6 = new NoodleFlavor();
n6.name = "怪味面";
n6.required.push(named("臊子"), 海鲜);
n6.recommended.push(葱花推荐);
n6.prohibited.push(盐须禁选);

const n7 = new NoodleFlavor();
n7.name = "肥肠面";
n7.required.push(named("肥肠"), named("红油"));
n7.recommended.push(盐须推荐);

const n8 = new NoodleFlavor();
n8.name = "豌杂面";
n8.required.push(named("臊子"), typed("菜"));
n8.recommended.push(红油推荐, 盐须推荐);

export const flavors = [n0, n1, n2, n3, n4, n5, n6, n7, n8];

function makeCustomer(name, score, rule, total, used) {
  return {
    name,
    score,
    total,
    used,
    setScoreWithDice(rng) {
      const scores = [];
      let { total, used } = this;
      total = total || 3;
      used = used || 2;
      for (let i = 0; i < total; i++) {
        scores.push(dice(6, rng));
      }
      scores.sort((a, b) => a - b);
      scores.length = Math.min(scores.length, used);
      this.score = scores.reduce((a, b) => a + b, 0);
    },
    rule
  };
}

export const customers = [
  makeCustomer("小学生", 5, player => {
    return player.bowls.filter(bowl => {
      if (!bowl.flavor) return false;
      if (bowl.ingredients.length >= 5) return false;
      return true;
    }).length;
  }),
  makeCustomer("大胃王", 5, player => {
    return player.bowls.filter(bowl => {
      if (!bowl.flavor) return false;
      if (bowl.ingredients.length < 5) return false;
      return true;
    }).length;
  }),
  makeCustomer(
    "打工人",
    10,
    player => {
      return player.bowls.filter(bowl => {
        if (!bowl.flavor) return false;
        if (bowl.flavor !== "特价面") return false;
        return true;
      }).length;
    },
    3,
    3
  ),
  makeCustomer("急性子", 5, player => {
    return player.bowls.filter(bowl => {
      if (!bowl.flavor) return false;
      return true;
    });
  }),

  makeCustomer("花泽", 6, player => {
    return player.bowls
      .map(bowl => {
        return bowl.ingredients.filter(ing => ing.name == "盐须").length;
      })
      .reduce((a, b) => Math.max(a, b), 0);
  }),
  makeCustomer("川妹子", 6, player => {
    return player.bowls
      .map(bowl => {
        return bowl.ingredients.filter(ing => ing.name == "红油").length;
      })
      .reduce((a, b) => Math.max(a, b), 0);
  }),
  makeCustomer("大彪汉", 6, player => {
    return player.bowls
      .map(bowl => {
        return bowl.ingredients.filter(ing => ing.type == "肉").length;
      })
      .reduce((a, b) => Math.max(a, b), 0);
  }),
  makeCustomer("海王", 6, player => {
    return player.bowls
      .map(bowl => {
        return bowl.ingredients.filter(海鲜).length;
      })
      .reduce((a, b) => Math.max(a, b), 0);
  })
];
