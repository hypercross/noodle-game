import React from "react";
import { AvatarCard, CustomerCard, FlavorCard, IngCard, BowlCard, ItemsRow, CarouselRow, HandCardRow } from "./card";
import { withAction } from "./action";
import {
    fromSeed,
    prepareFlavors, prepareCustomers, prepareIngredients,
    Game
} from "../game";

export function createGame(config) {

    const rng = fromSeed((config && config.seed) || undefined);
    const n = (config && config.nplayers) || 3;
    const localPlayer = (config && config.localPlayer) || 0;

    const ingredients = prepareIngredients();
    const flavors = prepareFlavors();
    const customers = prepareCustomers();

    // rng, n, localPlayer, ingredients, flavors, customers
    const game = new Game(rng, n, localPlayer, ingredients, flavors, customers);
    return game;
}

export function setupGame(game) {
    game.ingredients.deal(3);
    game.flavors.deal(game.players.length + 1);
    game.customers.deal(3);

    game.players[0].actions = 2;
    for (const player of game.players) {
        game.ingredients.deal(3, player.hand);
        game.flavors.deal(1, player.specialFlavors);
        player.update();
    }

    game.ingredients.update();
    game.flavors.update();
    game.customers.update();

    game.update();
}

const CustomerComponent = withAction(CustomerCard);
const FlavorComponent = withAction(FlavorCard);
const IngredientComponent = withAction(IngCard);
const BowlComponent = withAction(BowlCard);
const PlayerComponent = withAction(AvatarCard);
const HandComponent = function(props) {
    const { player } = props;
    player.useUpdate();
    return <ItemsRow items={player.hand.map(card => ({
        props: { selectable: card },
        Component: IngredientComponent
    }))} />
}
const DeckZoneComponent = function(props) {
    const { deck, draw, Component, ...others } = props;
    deck.useUpdate();
    const { zone } = deck.renderProps();
    const drawItem = draw && {
        Component,
        props: {
            key: 'draw',
            className: 'xxs pile',
            name: '抽卡',
            type: discardSize + drawSize,
        }
    };
    const items = zone.map(selectable => ({
        props: { selectable },
        Component: IngredientComponent
    }));
    if (drawItem) items.unshift(drawItem);
    return <ItemsRow items={items} {...others} />
}

export function GameLayout(props) {
    const { game } = props;
    const players = <ItemsRow items={game.players.map(player => (
        {
            Component: PlayerComponent,
            props: { selectable: player }
        }
    ))} />;

    const midrow = <CarouselRow aspect={[10, 4.5]} slides={[
        {
            Component: DeckZoneComponent, props: {
                Component: IngredientComponent, deck: game.ingredients, draw: true
            }
        },
        {
            Component: DeckZoneComponent, props: {
                Component: FlavorComponent, deck: game.flavors
            }
        },
        {
            Component: DeckZoneComponent, props: {
                Component: CustomerComponent, deck: game.customers
            }
        },
    ]} />;

    const bowls = <ItemsRow items={game.getLocalPlayer().bowls.map(bowl => ({
        props: { selectable: bowl },
        Component: BowlComponent
    }))} />;

    const hand = <HandComponent player={game.getLocalPlayer()} />

    return <div className="column">
        {players}
        {midrow}
        {bowls}
        {hand}
    </div>
}
