import React from "react";
import "./style.css";
import { CarouselProvider, Slider, Slide, DotGroup } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

import {
  Playcard,
  IngCard,
  OrderCard,
  BowlCard,
  CustomerCard,
  AvatarCard,
  testAvatar
} from "./card";

export default function KitchenSink() {
  return (
    <div>
      <div className="row hand">
        <AvatarCard {...testAvatar} className="xs" />
        <AvatarCard {...testAvatar} className="xs" />
        <AvatarCard {...testAvatar} className="xs" />
        <AvatarCard {...testAvatar} className="xs" />
      </div>
      <CarouselProvider
        totalSlides={3}
        naturalSlideHeight={40}
        naturalSlideWidth={100}
      >
        <Slider>
          <Slide index={0}>
            <div className="row">
              <IngCard name="抽卡" className="xxs pile" />
              <IngCard name="软浆叶" type="菜" className="xxs active" />
              <IngCard name="红油" type="佐料" className="xxs" />
              <IngCard name="盐须" type="佐料" className="xxs" />
            </div>
          </Slide>
          <Slide index={1}>
            <div className="row">
              <OrderCard
                name="红烧牛肉面"
                scores="￥13|￥8"
                className="horizontal xxs active"
              />
              <OrderCard
                name="番茄煎蛋面"
                scores="￥13|￥8"
                className="horizontal xxs"
              />
              <OrderCard
                name="脆绍面"
                scores="￥8|￥5"
                className="horizontal xxs"
              />
              <OrderCard
                name="脆绍面"
                scores="￥8|￥5"
                className="horizontal xxs"
              />
              <OrderCard
                name="脆绍面"
                scores="￥8|￥5"
                className="horizontal xxs"
              />
            </div>
          </Slide>
          <Slide index={2}>
            <div className="row">
              <CustomerCard
                name="小学生"
                desc="最多小份"
                className="xs"
                score={0}
              />
              <CustomerCard
                name="海王"
                desc="最多肉"
                className="xs"
                score={0}
              />
              <CustomerCard
                name="花泽"
                desc="最多盐须"
                className="xs"
                score={0}
              />
            </div>
          </Slide>
        </Slider>
        <DotGroup />
      </CarouselProvider>

      <div className="row">
        <BowlCard
          order="特价面"
          ingredients={[{ type: "肉" }, { type: "菜" }, { type: "佐料" }]}
          className="xs"
          score={3}
        />
        <BowlCard ingredients={[]} className="xs" score={0} />
        <BowlCard ingredients={[]} className="xs" score={0} />
      </div>

      <CarouselProvider
        totalSlides={hand.length}
        naturalSlideHeight={30}
        naturalSlideWidth={20}
        dragStep={4}
        visibleSlides={Math.min(hand.length, 5)}
      >
        <Slider>
          {hand.map((c, i) => {
            return <Slide key={i}>{c}</Slide>;
          })}
        </Slider>
        <DotGroup />
      </CarouselProvider>
      <div className="row hand" />
    </div>
  );
}

const testNodes = [
  <IngCard name="软浆叶" type="菜" className="xxs active" />,
  <IngCard name="红油" type="佐料" className="xxs" />,
  <IngCard name="盐须" type="佐料" className="xxs" />
];

const hand = [];
for (let i = 0; i < 30; i++) {
  hand.push(testNodes[Math.floor(Math.random() * 3)]);
}
