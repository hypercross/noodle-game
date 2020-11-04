import { Ingredient, Customer, Flavor } from "./noodle";

export const catalog = [
  { type: "肉", name: "墨鱼", isSeafood: true },
  { type: "肉", name: "花甲", isSeafood: true },
  { type: "肉", name: "虾", isSeafood: true },
  { type: "肉", name: "牛肉" },
  { type: "肉", name: "排骨" },
  { type: "肉", name: "臊子" },
  { type: "肉", name: "煎蛋" },
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

export function prepareIngredients() {
  const ingredients = [];
  for (const ing of catalog) {
    if (ing.name == "臊子") {
      for (let i = 0; i < 5; i++) ingredients.push(new Ingredient(ing.name, ing.type));
    } else if (ing.name == "红油") {
      for (let i = 0; i < 12; i++) ingredients.push(new Ingredient(ing.name, ing.type));
    } else if (ing.type == "肉") {
      for (let i = 0; i < 3; i++) ingredients.push(new Ingredient(ing.name, ing.type, ing.isSeafood));
    } else if (ing.type == "菜") {
      for (let i = 0; i < 4; i++) ingredients.push(new Ingredient(ing.name, ing.type));
    } else {
      for (let i = 0; i < 6; i++) ingredients.push(new Ingredient(ing.name, ing.type));
    }
  }
  return ingredients;
}

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

function buildMatcher(label, score, match) {
  return { label, score, match };
}

const 葱花推荐 = buildMatcher("葱花推荐", 2, ing => ing.name == "葱花");
const 葱花禁选 = buildMatcher("葱花禁选", -3, ing => ing.name == "葱花");

const 盐须推荐 = buildMatcher("盐须推荐", 2, ing => ing.name == "盐须");
const 盐须禁选 = buildMatcher("盐须禁选", -3, ing => ing.name == "盐须");

const 红油推荐 = buildMatcher("红油推荐", 2, ing => ing.name == "红油");
const 红油禁选 = buildMatcher("红油禁选", -3, ing => ing.name == "红油");

const 海鲜 = buildMatcher('海鲜', 0, ing => ing.isSeafood);

function named(name) {
  return buildMatcher('是' + name, 0, ing => ing.name == name);
}

function typed(type) {
  return buildMatcher('是' + type, 0, ing => ing.type == type);
}
const n0 = Flavor.defaultConfig();
n0.name = "特价面";
n0.tiers = [{ count: 1, tier: "折扣", score: 0 }];

const n1 = Flavor.defaultConfig();
n1.name = "番茄煎蛋面";
n1.required.push(named("番茄"), named("煎蛋"));
n1.recommended.push(葱花推荐);
n1.prohibited.push(红油禁选);

const n2 = Flavor.defaultConfig();
n2.name = "红烧排骨面";
n2.required.push(named("排骨"), named("红油"));
n2.recommended.push(葱花推荐);
n2.prohibited.push(盐须禁选);

const n3 = Flavor.defaultConfig();
n3.name = "红烧牛肉面";
n3.required.push(named("牛肉"), named("红油"));
n3.recommended.push(盐须推荐);

const n4 = Flavor.defaultConfig();
n4.name = "海鲜面";
n4.required.push(海鲜, 海鲜);
n4.prohibited.push(红油禁选);

const n5 = Flavor.defaultConfig();
n5.name = "脆绍面";
n5.required.push(named("红油"), named("臊子"));
n5.recommended.push(葱花推荐);

const n6 = Flavor.defaultConfig();
n6.name = "怪味面";
n6.required.push(named("臊子"), 海鲜);
n6.recommended.push(葱花推荐);
n6.prohibited.push(盐须禁选);

const n7 = Flavor.defaultConfig();
n7.name = "肥肠面";
n7.required.push(named("肥肠"), named("红油"));
n7.recommended.push(盐须推荐);

const n8 = Flavor.defaultConfig();
n8.name = "豌杂面";
n8.required.push(named("臊子"), typed("菜"));
n8.recommended.push(红油推荐, 盐须推荐);

export const flavors = [n1, n2, n3, n4, n5, n6, n7, n8].map(o => new Flavor(o));
export function prepareFlavors(){
  const flavorDeck = [];
  flavors.forEach(flavor => flavorDeck.push(flavor.clone(), flavor.clone()));
  return {
    flavors: flavorDeck,
    bargain: new Flavor(n0)
  }
}

function makeCustomer(name, score, rule, total, used) {
  return new Customer(name, score, rule, total, used);
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

export function prepareCustomers(){
  return customers;
}
