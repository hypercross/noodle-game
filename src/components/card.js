import React from "react";
import "./style.css";
import { useGesture } from "react-use-gesture";

import { CarouselProvider, Slider, Slide, DotGroup } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

function addClass(props, className) {
  className += " " + ((props && props.className) || "");
  return {
    ...props,
    className
  };
}

export function Playcard(props) {
  const { active, disabled, onToggleActive, ...others } = props;
  const className = `playcard ${active ? "active" : ""} ${disabled ? "disabled" : ""}`;
  const bind = useGesture({
    onDragStart() {
      onToggleActive && onToggleActive();
    }
  })
  return <div {...bind()} {...addClass(others, className)}>{props.children}</div>;
}

export function IngCard(props) {
  const { name, type, isSeafood, ...others } = props;
  return (
    <Playcard {...others}>
      <h1>{name}</h1>
      <h2>{type}</h2>
    </Playcard>
  );
}

export function FlavorCard(props) {
  const { name, scores, ...others } = props;
  return (
    <Playcard {...others}>
      <h2>{name}</h2>
      <h2>{scores}</h2>
    </Playcard>
  );
}

export function CardIcon(props) {
  const { i, j, type, others } = props;
  return (
    <circle
      cx={i * 10}
      cy={(j || 0) * 10}
      r="4"
      {...addClass(others, "cicon cicon-" + type)}
    />
  );
}

export function ingredientIconName(ing) {
  if (ing && ing.type) return "ing-" + ing.type;
  return "ing-none";
}

export function BowlProgress(props) {
  return (
    <svg width="5em" height="1em" viewBox="-5 -5 50 10">
      {[0, 1, 2, 3, 4].map(i => (
        <CardIcon key={i} i={i} type={ingredientIconName(props.ingredients[i])} />
      ))}
    </svg>
  );
}

export function BowlCard(props) {
  const { flavor, ingredients, score, ...others } = props
  return (
    <Playcard {...others}>
      <h2>{flavor || "未完成"}</h2>
      <h3>
        <BowlProgress ingredients={ingredients} />
      </h3>
      <h2>￥{score}</h2>
    </Playcard>
  );
}

export function CustomerCard(props) {
  const { name, score, ...others } = props;
  return (
    <Playcard {...others}>
      <h1>{name}</h1>
      <h2>￥{score}</h2>
    </Playcard>
  );
}

export function AvatarCard(props) {
  const actions = [];
  for (let i = 0; i < props.actions; i++) {
    actions.push(
      <CardIcon key={i} i={4 - (i % 5)} j={Math.floor(i / 5)} type="action" />
    );
  }
  const actionRows = Math.floor((actions.length - 1) / 5) + 1;
  const customers = [];
  for (let i = 0; i < props.customers; i++) {
    customers.push(
      <CardIcon
        key={i + actions.length + 1}
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

export function CarouselRow(props) {
  const { slides, aspect, ...others } = props;
  return <CarouselProvider {...others}
    naturalSlideWidth={aspect[0]}
    naturalSlideHeight={aspect[1]}
    totalSlides={slides.length}
  >
    <Slider> {
      slides.map(({ props, Component }, i) => (
        <Slide key={i} index={i}><Component {...props} /></Slide>
      ))
    } </Slider>
    <DotGroup />
  </CarouselProvider>
}

export function ItemsRow(props) {
  const { items, ...others } = props;
  others.className = (others.className || "") + " row";
  return <div {...others}> {
    items.map(({ props, Component }) => <Component {...props} />)
  } </div>
}

export function HandCardRow(props) {
  return <CarouselRow
    dragStep={4}
    visibleSlides={Math.min(props.slides.length, 5)}
    {...props}
  />
}
