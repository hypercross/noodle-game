import { fromSeed } from "./rng";
import { Action } from "./action";
import { prepareFlavors, prepareCustomers, prepareIngredients, } from "./sichuan";
import { Game, Ingredient, Bowl } from "./noodle";

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

    actions.push(
        new PlayIngredientAction(game),
        new DrawIngredientAction(game),
        new CompleteFlavorAction(game)
    );
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

class GameAction extends Action {
    fromParams() {
        const [game] = this.params;
        this.game = game;
        this.player = game.getLocalPlayer();
    }
}

class CompleteFlavorAction extends GameAction {
    name = '完成';

    match(selected) {
        if (this.player.actions <= 0)
            return -1;

        let bowl = null;
        let flavor = null;

        for (const one of selected) {
            if (this.player.bowls.indexOf(one) >= 0) {
                if(bowl)return -1;
                bowl = one;
            } else if (this.player.specialFlavors.indexOf(one) >= 0) {
                if(flavor)return -1;
                flavor = one;
            } else if (this.game.flavors.zonelist.indexOf(one) >= 0) {
                if(flavor)return -1;
                flavor = one;
            } else {
                return -1;
            }
        }

        if(!bowl || !flavor)
            return 0;

        if(flavor.findMatch(bowl.ingredients, flavor.required))
            return 1;
        return -1;
    }

    run(selected) {
        this.player.actions--;

        let bowl = null;
        let flavor = null;
        for (const one of selected) {
            if (one instanceof Bowl) {
                bowl = one;
            } else {
                const sfi = this.player.specialFlavors.indexOf(one);
                if (sfi >= 0) {
                    this.player.specialFlavors.splice(sfi, 1);
                    this.player.update();
                    flavor = one;
                    continue;
                }
                const zli = this.game.flavors.zonelist.indexOf(one);
                if (zli >= 0) {
                    this.game.flavors.zonelist.splice(zli, 1);
                    this.game.flavors.update();
                    flavor = one;
                    continue;
                }
                throw new Error("I don't know what this is");
            }
        }

        bowl.setFlavor(flavor);
        bowl.update();
    }
}

class DrawIngredientAction extends GameAction {
    name = '拿食材';

    match(selected) {
        // no actions left
        if (this.player.actions <= 0)
            return -1;

        // empty -> 0
        if (selected.length == 0)
            return 0;

        if (selected.length >= 2)
            return -1;

        const [card] = selected;
        if (this.game.ingredients.zonelist.indexOf(card) >= 0) {
            return 1;
        } else if (this.game.drawTarget == card && this.game.ingredients.available() > 0) {
            return 1;
        }

        return -1;
    }
    run(selected) {
        const player = this.player;
        const ingredients = this.game.ingredients;

        this.player.actions--;

        const [card] = selected;
        const i = ingredients.zonelist.indexOf(card);

        if (i >= 0) {
            ingredients.zonelist.splice(i, 1);
            player.hand.push(card);
            ingredients.deal(1);
        } else if (this.game.drawTarget == card) {
            ingredients.deal(1, player.hand);
            ingredients.discardlist.push(...ingredients.zonelist);
            ingredients.zonelist.length = 0;
            ingredients.deal(3);
        }

        this.game.ingredients.update();
        this.player.update();
    }
}

class PlayIngredientAction extends GameAction {
    name = '下料';

    isLocalHandCard(card) {
        return this.player.hand.indexOf(card) >= 0;
    }

    isLocalBowl(card) {
        return this.player.bowls.indexOf(card) >= 0;
    }

    match(selected) {
        // no actions left
        if (this.player.actions <= 0) return -1;

        // empty -> 0
        if (selected.length == 0) {
            return 0;
        }

        // not all ingredients in all but the last one -> -1
        const ilast = selected.length - 1;
        for (let i = 0; i < ilast; i++) {
            if (!this.isLocalHandCard(selected[i])) {
                return -1;
            }
        }

        // have more than one type of ingredients -> -1
        const ing = selected[0];
        for (const one of selected) {
            if (one instanceof Ingredient && one.name != ing.name)
                return -1;
        }

        // check last one
        if (this.isLocalHandCard(selected[ilast])) {
            return 0;
        } else if (this.isLocalBowl(selected[ilast])) {
            if (ilast == 0) return -1;
            const size = selected[ilast].ingredients.length + selected.length - 1;
            if (size > 5) return -1;
            return 1;
        } else {
            return -1;
        }
    }

    run(selected) {
        const bowl = selected.pop();
        const player = this.player;
        player.addIngredient(bowl, ...selected);
        player.actions--;
        player.update();
        bowl.update();
    }
}
