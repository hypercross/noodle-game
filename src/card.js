import React from "react";

export function Playcard(props) {
  const className = "playcard " + (props.className || "");
  return <div className={className}>{props.children}</div>;
}

export function IngCard(props) {
  return (
    <Playcard className={props.className}>
      <h1>{props.name}</h1>
      <h2>{props.type}</h2>
    </Playcard>
  );
}

export function OrderCard(props) {
  return (
    <Playcard className={props.className}>
      <h2>{props.name}</h2>
      <h2>{props.scores}</h2>
    </Playcard>
  );
}

export function CardIcon(props) {
  return <span className={"cicon cicon-" + props.type} />;
}

export function iconName(ing) {
  if (ing && ing.type) return "ing-" + ing.type;
  return "ing-none";
}

export function BowlProgress(props) {
  return (
    <React.Fragment>
      {[0, 1, 2, 3, 4].map(i => (
        <CardIcon key={i} type={iconName(props.ingredients[i])} />
      ))}
    </React.Fragment>
  );
}

export function BowlCard(props) {
  return (
    <Playcard className={props.className}>
      <h2>{props.order || "未完成"}</h2>
      <h3>
        <BowlProgress ingredients={props.ingredients} />
      </h3>
      <h2>￥{props.score}</h2>
    </Playcard>
  );
}

export function CustomerCard(props) {
  return (
    <Playcard className={props.className}>
      <h1>{props.name}</h1>
      <h2>{props.desc}</h2>
    </Playcard>
  );
}

export function AvatarCard(props) {
  return (
    <Playcard className={(props.className || "") + " avatar"}>
      <div className="labels">
        <h2>{props.name}</h2>
        <h3>{props.score}</h3>
        <div
          className="avatar"
          style={{ backgroundImage: `url("${props.avatar}")` }}
        />
      </div>
      <div className="stats">
        {props.stats.map((stat, i) => (
          <div className="stat" key={i}>
            {stat}
          </div>
        ))}
      </div>
    </Playcard>
  );
}

function hash8() {
  return Math.random()
    .toString(16)
    .slice(-8);
}
function hash32() {
  return hash8() + hash8() + hash8() + hash8();
}
export const testAvatar = {
  avatar: "//robohash.org/" + "player1" + "?set=set4&size=80x80",
  name: "hyper",
  score: "￥80",
  stats: [
    <BowlProgress ingredients={[{ type: "肉" }]} />,
    <BowlProgress ingredients={[]} />,
    <BowlProgress ingredients={[]} />
  ]
};
