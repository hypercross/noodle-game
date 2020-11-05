import React, { useMemo, useEffect } from "react";
import { ActionContext } from "../game";
import { ActionContextProvider, withAction, useActionContext } from "./actionctx";
import { AvatarCard, BowlCard, CarouselRow, CustomerCard, FlavorCard, HandCardRow, IngCard, ItemsRow } from "./card";

const CustomerComponent = withAction(CustomerCard);
const FlavorComponent = withAction(FlavorCard);
const IngredientComponent = withAction(IngCard);
const BowlComponent = withAction(BowlCard);
const PlayerComponent = withAction(AvatarCard);
const HandComponent = function(props) {
    const { player } = props;
    player.useUpdate();
    return <HandCardRow aspect={[2, 3]} slides={player.hand.map(card => ({
        props: { selectable: card, className: 'xxs', key: card.id },
        Component: IngredientComponent
    }))} />
}
const OwnedComponent = function(props) {
    const { player } = props;
    player.useUpdate();

    const flavors = player.specialFlavors.map(card => ({
        props: { selectable: card, className: 'xxs horizontal', key: card.id },
        Component: FlavorComponent
    }));

    const customers = player.customers.map(card => ({
        props: { selectable: card, className: 'xxs', key: card.id },
        Component: CustomerComponent
    }));

    return <ItemsRow items={flavors.concat(customers)} />
}
const DeckZoneComponent = function(props) {
    const { deck, draw, Component, componentProps, ...others } = props;
    deck.useUpdate();
    const { zone } = deck.renderProps();
    const drawItem = draw && {
        Component: IngredientComponent,
        props: {
            key: 'draw',
            selectable: draw,
            ...componentProps
        }
    };
    const items = zone.map(selectable => ({
        props: { selectable, key: selectable.id, ...componentProps },
        Component
    }));
    if (drawItem) items.unshift(drawItem);
    return <ItemsRow items={items} {...others} />
}
const ActionsComponent = function() {
    const ctx = useActionContext();
    ctx.useUpdate();
    useEffect(function() {
        ctx.updateAll();
    }, [ctx]);

    const actions = ctx.actions.filter(action => !action.disabled).map(
        action => ({
            Component: 'button',
            props: {
                children: action.name,
                onClick() {
                    action.run(ctx.selected);
                    ctx.clearSelection();
                },
                disabled: !action.active,
                key: action.name
            }
        })
    );

    actions.unshift({
        Component: 'button',
        props: {
            children: '取消',
            onClick() {
                ctx.clearSelection();
            },
            key: 'cancel'
        },
    });

    return <ItemsRow items={actions} />
}

export function GameLayout(props) {
    const { game } = props;
    const ctx = useMemo(function() {
        const ctx = new ActionContext();
        ctx.actions = game.actions;
        return ctx;
    }, [game]);
    const players = <ItemsRow className="hand" items={game.players.map(player => (
        {
            Component: PlayerComponent,
            props: { selectable: player, className: "xs", key: player.id }
        }
    ))} />;

    const midrow = <CarouselRow aspect={[10, 4.5]} slides={[
        {
            Component: DeckZoneComponent, props: {
                Component: IngredientComponent, deck: game.ingredients, draw: game.drawTarget,
                componentProps: { className: 'xxs' }
            }
        },
        {
            Component: DeckZoneComponent, props: {
                Component: FlavorComponent, deck: game.flavors,
                componentProps: { className: 'xxs horizontal' }
            }
        },
        {
            Component: DeckZoneComponent, props: {
                Component: CustomerComponent, deck: game.customers,
                componentProps: { className: 'xxs' }
            }
        }, {
            Component: OwnedComponent, props: {
                player: game.getLocalPlayer()
            }
        }
    ]} />;

    const bowls = <ItemsRow items={game.getLocalPlayer().bowls.map((bowl, key) => ({
        props: { selectable: bowl, className: 'xs', key },
        Component: BowlComponent
    }))} />;

    const hand = <HandComponent player={game.getLocalPlayer()} />

    return <div className="column">
        <ActionContextProvider value={ctx}>
            {players}
            {midrow}
            {bowls}
            {hand}
            <ActionsComponent />
        </ActionContextProvider>
    </div>
}
