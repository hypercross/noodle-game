import { fromSeed } from "./rng";
import { prepareFlavors, prepareCustomers, prepareIngredients, } from "./sichuan";
import { Game } from "./noodle";

export function createGame(config) {

    const rng = fromSeed((config && config.seed) || undefined);
    const n = (config && config.nplayers) || 3;
    const localPlayer = (config && config.localPlayer) || 0;

    const ingredients = prepareIngredients();
    const { flavors, bargain } = prepareFlavors();
    const customers = prepareCustomers();

    // rng, n, localPlayer, ingredients, flavors, customers
    const game = new Game(rng, n, localPlayer, ingredients, flavors, bargain, customers);
    return game;
}

export function setupGame(game) {
    game.ingredients.shuffle();
    game.ingredients.deal(3);

    game.flavors.shuffle();
    game.flavors.deal(game.players.length + 1);

    game.customers.shuffle();
    game.customers.deal(3);

    game.players[0].actions = 2;
    for (const player of game.players) {
        game.ingredients.deal(3, player.hand);
        game.flavors.deal(1, player.specialFlavors);

        player.specialFlavors.push(
            game.bargain.clone(),
            game.bargain.clone(),
        );
        player.update();
    }

    game.ingredients.update();
    game.flavors.update();
    game.customers.update();

    game.update();
}
