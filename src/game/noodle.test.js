import {
    Ingredient,
    Flavor,
    Customer,
    Deck,
    Bowl,
    Player
} from "./noodle";

import { fromSeed } from "./rng";

const seed = fromSeed('weed');

test('ingredient', () => {
    const i = new Ingredient('肉', '牛肉');
    expect(i.isSeafood).toBe(undefined);
    expect(i.name).toBe('牛肉');
})

test('flavor', () => {
    const o = Flavor.defaultConfig();
    o.name = '海鲜面';
    o.required.push({
        label: '海鲜',
        match(t) { return t.isSeefood; },
    });
    o.prohibited.push({
        label: '禁选红油',
        match(t) { return t.name == '红油'; },
        score: -3
    });
    o.recommended.push({
        label: '推荐盐须',
        match(t) { return t.name == '盐须'; },
        score: 2
    });

    const flavor = new Flavor(o);
    const renderProps = flavor.renderProps();
    expect(renderProps.name).toBe('海鲜面');
    expect(renderProps.scores).toBe('大份￥13, 小份￥8');

    let match = flavor.prohibitedRule([{ name: '红油' }]);
    expect(JSON.stringify(match)).toBe("{}");
    match = flavor.prohibitedRule([{ name: '红油' }, { name: '鱿鱼', isSeefood: true }]);
    expect(match.score).toBe(-3);
});

test('customer', () => {
    const rule = (p) => p.name.length;
    const c = new Customer('海王', 6,
        rule,
        3, 2);
    expect(c.name).toBe('海王');
    expect(c.score).toBe(6);
    expect(c.rule).toBe(rule);

    c.setScoreFromDice(seed);
    expect(c.score).toBe(7);

    const props = c.renderProps();
    expect(props.name).toBe("海王");
    expect(props.score).toBe(7);
    expect(props.key).toBe(c.id);

    const players = [
        { name: 'woo' },
        { name: 'baa' },
        { name: 'booooosta' },
        { name: 'tart' },
    ];
    const top = c.topPlayer(players);
    expect(top).toBe(players[2]);

    players.push({ name: 'baaaoosta' });
    const top2 = c.topPlayer(players);
    expect(top2).toBe(null);
});

test('deck', () => {
    const deck = new Deck(seed, [1,2,3]);
    expect(deck.drawlist.length).toBe(3);

    deck.deal(2);
    expect(deck.zonelist.length).toBe(2);
    expect(deck.drawlist.length).toBe(1);

    deck.discard(1);
    deck.discard(2);
    deck.discard(3);
    expect(deck.zonelist.length).toBe(0);
    expect(deck.discardlist.length).toBe(2);

    deck.deal(2);
    expect(deck.drawlist.length).toBe(1);
    expect(deck.discardlist.length).toBe(0);
    expect(deck.zonelist.length).toBe(2);
});


test('bowl',()=>{
    const bowl = new Bowl();
    expect(bowl.totalScore()).toBe(0);

    bowl.setFlavor(new Flavor(Flavor.defaultConfig()));
    bowl.ingredients.push(1);
    expect(bowl.totalScore()).toBe(8);
    expect(bowl.flavor.name).toBe('点单');

    const props = bowl.renderProps();
    expect(props.flavor).toBe('点单');
    expect(props.score).toBe(8);
})

test('player', () => {
    const player = new Player('boohah');
    expect(player.renderProps().name).toBe('boohah');

    const ing = {name: 'shark'};
    player.hand.push(ing);

    player.addIngredient(player.bowls[0], ing);
    player.bowls[0].setFlavor(new Flavor(Flavor.defaultConfig()));
    expect(player.hand.length).toBe(0);
    expect(player.bowls[0].ingredients.length).toBe(1);
    expect(player.renderProps().score).toBe(`￥8`);
})
