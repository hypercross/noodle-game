import React from "react";
import ReactDOM from "react-dom";

// import { KitchenSink } from "./components/kitchensink";
// ReactDOM.render(<KitchenSink />, document.getElementById("root"));

import * as table from "./components/table";
const game = table.createGame();
const { GameLayout } = table;
ReactDOM.render(<GameLayout game={game} />, document.getElementById("root"));
