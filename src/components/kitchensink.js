import React from "react";

import {
  Playcard,
  IngCard,
  FlavorCard,
  BowlCard,
  CustomerCard,
  AvatarCard,
  CarouselRow,
  ItemsRow,
  HandCardRow,
} from "./card";

export function KitchenSink() {
  return (
    <div className="column">

      <h3>Playcard Row</h3>
      <ItemsRow items={[{
        props: { children: 'blah', className: 'xs', key: 2 },
        Component: Playcard,
      }]} />

      <h3>Row of AvatarCards</h3>
      <ItemsRow items={testAvatarItems} className="hand" />

      <h3>Row of Flavors</h3>
      <ItemsRow items={[{
        Component: FlavorCard,
        props: {
          key: 0, name: '红烧牛肉面', scores: '￥13, ￥8',
          className: "horizontal xxs"
        }
      }]} className="hand" />

      <h3>Row of Bowl</h3>
      <ItemsRow items={[{
        props: {
          className: "xs", flavor: '红烧牛肉面', ingredients: [{
            type: '肉'
          }], score: 12, key: 1
        },
        Component: BowlCard
      }]} />

      <h3>Row of Customers</h3>
      <CarouselRow aspect={[10, 4.5]} slides={[{
        props: {
          className: 'xxs',
          name: '海王',
          score: 5
        },
        Component: CustomerCard
      }]} />

      <h3>Row of Hand</h3>
      <HandCardRow aspect={[2, 3]} slides={hand} />
    </div>
  );
}

const testNodes = [
  { name: "软浆叶", type: "菜" },
  { name: "红油", type: "佐料" },
  { name: "盐须", type: "佐料" },
];

const hand = [];
for (let i = 0; i < 30; i++) {
  const { name, type } = testNodes[Math.floor(Math.random() * 3)];
  hand.push({
    props: { name, type, key: Math.random(), className: 'xxs' },
    Component: IngCard
  });
}

const testAvatar = {
  name: 'Dude',
  avatar: '//robohash.org/Dude?set=set5&size=200x200',
  score: '￥82',
  actions: 2,
  customers: 2,
  stats: [
    [{ type: '肉' }, { type: '菜' }, { type: '佐料' }],
    [{ type: '肉' }, { type: '菜' }, { type: '佐料' }],
    [{ type: '肉' }, { type: '佐料' }],
  ],
  className: 'xs'
}
const testAvatarItems = [testAvatar, testAvatar, testAvatar, testAvatar].map(
  (props, key) => ({ props: { ...props, key }, Component: AvatarCard })
);
