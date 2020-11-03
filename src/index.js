import React from "react";
import ReactDOM from "react-dom";

import App from "./kitchensink";
import { makeGame } from "./setup";

// ReactDOM.render(<App />, document.getElementById("root"));

const game = makeGame(3);
ReactDOM.render(<game.render />, document.getElementById("root"));
