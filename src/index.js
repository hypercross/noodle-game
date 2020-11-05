import React from "react";
import ReactDOM from "react-dom";

// import { KitchenSink } from "./components/kitchensink";
// ReactDOM.render(<KitchenSink />, document.getElementById("root"));

import { GameLayout } from "./components/table";
import { createGame, setupGame } from "./game";
const game = createGame();
setupGame(game);

ReactDOM.render(<GameLayout game={game} />, document.getElementById("root"));
