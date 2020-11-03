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
    flavors.push({ ...flavor }, { ...flavor });
  }

  const customers = sichuan.customers.slice();

  game.init(game.rng, ingredients, flavors, customers);
  game.ingredients.deal(3);
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

function renderGame(game) {
  self.game = game;

  const playerRow = (
    <div className="row hand">
      {game.players.map(player => (
        <PlayerComponent key={player.id} player={player} />
      ))}
    </div>
  );

  const ingredients = <Ingredients game={game} />;

  return (
    <div>
      {playerRow}
      {ingredients}
    </div>
  );
}
