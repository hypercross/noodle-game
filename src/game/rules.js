import { fromSeed } from "./rng";
import { Action } from "./action";
import { prepareFlavors, prepareCustomers, prepareIngredients, } from "./sichuan";
import { Game, Ingredient } from "./noodle";

export function createGame(config) {

    const rng = fromSeed((config && config.seed) || undefined);
    const n = (config && config.nplayers) || 3;
    const localPlayer = (config && config.localPlayer) || 0;

    const ingredients = prepareIngredients();
    const { flavors, bargain } = prepareFlavors();
    const customers = prepareCustomers();

    const actions = [];
    // rng, n, localPlayer, ingredients, flavors, customers
    const game = new Game(rng, n, localPlayer,
                          ingredients, flavors, bargain, customers,
                          actions);

    actions.push(new PlayIngredientAction(game));
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


class PlayIngredientAction extends Action {
    fromParams(){
        const [game] = this.params;
        this.game = game;
        this.name = '下料';
    }

    isLocalHandCard(card){
        return this.game.getLocalPlayer().hand.indexOf(card) >= 0;
    }

    isLocalBowl(card){
        return this.game.getLocalPlayer().bowls.indexOf(card) >= 0;
    }

    match(selected){
        // empty -> 0
        if(selected.length == 0)return 0;

        // not all ingredients in all but the last one -> -1
        const ilast = selected.length - 1;
        for(let i = 0; i < ilast; i ++){
            if(!this.isLocalHandCard(selected[i])){
                return -1;
            }
        }

        // have more than one type of ingredients -> -1
        const ing = selected[0];
        for(const one of selected){
            if(one instanceof Ingredient && one.name != ing.name)
                return -1;
        }

        // check last one
        if(this.isLocalHandCard(selected[ilast])){
            return 0;
        }else if(this.isLocalBowl(selected[ilast])){
            const size = selected[ilast].ingredients.length + selected.length - 1;
            if(size > 5)return -1;
            return 1;
        }else{
            return -1;
        }
    }
}