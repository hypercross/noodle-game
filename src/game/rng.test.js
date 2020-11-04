import { shuffle, dice, hash, fromSeed } from "./rng";

const seed = fromSeed('weed');

test('shuffling', () => {
    const deck = [1,3,2,4,5,3,6];
    shuffle(deck, seed);
    const concat = deck.join(',');
    expect(concat).toEqual('2,5,4,6,3,3,1');
});


test('dice throws', () => {
    expect(dice(6,seed)).toEqual(1);
    expect(dice(6,seed)).toEqual(2);
    expect(dice(6,seed)).toEqual(2);
    expect(dice(6,seed)).toEqual(4);
    expect(dice(6,seed)).toEqual(6);
});

test('hashing', () => {
    expect(hash(14,seed).length).toEqual(14);
});
