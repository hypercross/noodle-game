import random from "random";
import seedrandom from "seedrandom";

const defaultSeed = seedrandom();
export function fromSeed(seed) {
  return seedrandom(seed);
}

export function shuffle(deck, rng) {
  if (rng) {
    random.use(rng);
  } else {
    random.use(defaultSeed);
  }
  for (let i = 0; i < deck.length; i++) {
    const j = random.int(i, deck.length - 1);

    const t = deck[j];
    deck[j] = deck[i];
    deck[i] = t;
  }
}

export function dice(n, rng) {
  if (rng) {
    random.use(rng);
  } else {
    random.use(defaultSeed);
  }

  return random.int(1, n);
}
