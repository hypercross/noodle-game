import { Game } from "./noodle";
import * as sichuan from "./sichuan";

import React from "react";
import { CarouselProvider, Slider, Slide, DotGroup } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import "./style.css";

import {
  Playcard,
  IngCard,
  OrderCard,
  BowlCard,
  CustomerCard,
  AvatarCard,
  testAvatar
} from "./card";

export function makeGame(n) {
  const game = new Game(n);

  const ingredients = [];
  for (const ing of sichuan.catalog) {
    if (ing.type == "肉") {
      for (let i = 0; i < 3; i++) ingredients.push({ ...ing });
    } else if (ing.type == "菜") {
      for (let i = 0; i < 4; i++) ingredients.push({ ...ing });
    } else if (ing.name == "臊子") {
      for (let i = 0; i < 4; i++) ingredients.push({ ...ing });
    } else if (ing.name == "红油") {
      for (let i = 0; i < 12; i++) ingredients.push({ ...ing });
    } else {
      for (let i = 0; i < 6; i++) ingredients.push({ ...ing });
    }
  }

  const flavors = [];
  for (const flavor of sichuan.flavors) {
    flavors.push(flavor, flavor);
  }

  const customers = sichuan.customers.map(c => ({ ...c }));

  game.init(game.rng, ingredients, flavors, customers);
  game.ingredients.deal(3);
  game.flavors.deal(5);
  game.customers.deal(3);
  game.ingredients.deal(30, game.getLocalPlayer().hand);
  game.customers.deal(1, game.getLocalPlayer().customers);
  game.flavors.deal(1, game.getLocalPlayer().specialFlavors);
  game.players[0].actions = 3;
  return {
    game,
    flavors,
    ingredients,
    customers,
    render: () => renderGame(game)
  };
}

function PlayerComponent(props) {
  props.player.useUpdate();
  return <AvatarCard {...props.player.renderProps()} className="xs" />;
}

function Ingredients(props) {
  props.game.ingredients.useUpdate();
  const ings = props.game.ingredients.renderProps();
  return (
    <div className="row">
      <IngCard
        key="draw"
        name="抽卡"
        type={ings.discardSize + ings.drawSize}
        className="xxs pile"
      />
      {ings.zone.map((z, i) => (
        <IngCard key={i} name={z.name} type={z.type} className="xxs" />
      ))}
    </div>
  );
}

function Flavors(props) {
  props.game.flavors.useUpdate();
  const flavors = props.game.flavors.renderProps();
  return (
    <div className="row">
      {flavors.zone.map((flavor, i) => (
        <OrderCard
          key={i}
          {...flavor.renderProps()}
          className="horizontal xxs"
        />
      ))}
    </div>
  );
}

function Customers(props) {
  props.game.customers.useUpdate();
  const customers = props.game.customers.renderProps();
  return (
    <div className="row">
      {customers.zone.map((customer, i) => (
        <CustomerCard key={i} {...customer} className="xxs" />
      ))}
    </div>
  );
}

function Bowl(props) {
  const bowl = props.bowl.renderProps();
  return <BowlCard {...bowl} className="xs" />;
}

function Hand(props) {
  const player = props.player;
  player.useUpdate();
  const hand = player.hand;

  return (
    <CarouselProvider
      totalSlides={hand.length}
      naturalSlideHeight={3}
      naturalSlideWidth={2}
      dragStep={4}
      visibleSlides={Math.min(hand.length, 5)}
    >
      <Slider>
        {hand.map((c, i) => {
          return (
            <Slide key={i}>
              <IngCard {...c} className="xxs" />
            </Slide>
          );
        })}
      </Slider>
      <DotGroup />
    </CarouselProvider>
  );
}

function renderGame(game) {
  self.game = game;

  const playerRow = (
    <div className="row hand">
      {game.players.map(player => (
        <PlayerComponent key={player.id} player={player} />
      ))}
    </div>
  );

  const wrapped = (
    <CarouselProvider
      naturalSlideWidth="10"
      naturalSlideHeight="4.5"
      totalSlides="3"
    >
      <Slider>
        <Slide index={0}>
          <Ingredients game={game} />
        </Slide>
        <Slide index={1}>
          <Flavors game={game} />
        </Slide>
        <Slide index={2}>
          <Customers game={game} />
        </Slide>
      </Slider>
      <DotGroup />
    </CarouselProvider>
  );

  const bowlRow = (
    <div className="row">
      {game.getLocalPlayer().bowls.map(bowl => (
        <Bowl key={bowl.id} bowl={bowl} />
      ))}
    </div>
  );

  const hands = <Hand player={game.getLocalPlayer()} />;

  return (
    <div className="column">
      {playerRow}
      {wrapped}
      {bowlRow}
      {hands}
    </div>
  );
}
