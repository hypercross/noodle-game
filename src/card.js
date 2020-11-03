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
  return (
    <circle
      cx={props.i * 10}
      cy={(props.j || 0) * 10}
      r="4"
      className={"cicon cicon-" + props.type}
    />
  );
}

export function iconName(ing) {
  if (ing && ing.type) return "ing-" + ing.type;
  return "ing-none";
}

export function BowlProgress(props) {
  return (
    <svg width="5em" height="1em" viewBox="-5 -5 50 10">
      {[0, 1, 2, 3, 4].map(i => (
        <CardIcon key={i} i={i} type={iconName(props.ingredients[i])} />
      ))}
    </svg>
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
      <h2>￥{props.score}</h2>
    </Playcard>
  );
}

function duplicate(x, n) {
  if (n < 1) return "";
  return n > 0 ? duplicate(x, n - 1) + x : x;
}

export function AvatarCard(props) {
  const actions = [];
  for (let i = 0; i < props.actions; i++) {
    actions.push(
      <CardIcon i={4 - (i % 5)} j={Math.floor(i / 5)} type="action" />
    );
  }
  const actionRows = Math.floor((actions.length - 1) / 5) + 1;
  const customers = [];
  for (let i = 0; i < props.customers; i++) {
    customers.push(
      <CardIcon
        i={4 - (i % 5)}
        j={Math.floor(i / 5) + actionRows}
        type="customer"
      />
    );
  }
  const customerRows = Math.floor((customers.length - 1) / 5) + 1;
  return (
    <Playcard className={(props.className || "") + " avatar"}>
      <div className="labels">
        <h2>{props.name}</h2>
        <h2>{props.score}</h2>
        <div
          className="avatar"
          style={{ backgroundImage: `url("${props.avatar}")` }}
        />
      </div>
      <div className="stats">
        <div className="flex">
          {props.stats.map((stat, i) => (
            <div className="stat" key={i}>
              <BowlProgress ingredients={stat} />
            </div>
          ))}
        </div>
        <h3>
          <svg
            width="5em"
            height={actionRows + customerRows + "em"}
            viewBox={"-5 -5 50 " + (actionRows + customerRows) * 10}
          >
            {actions}
            {customers}
          </svg>
        </h3>
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
  stats: [[{ type: "肉" }], [], []]
};
