import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap";
import "bootstrap/dist/js/bootstrap.js";
// import $ from "jquery";
// import Popper from "popper.js";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.css";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://1a9d594c9d87452ba6c80b093b44a7b1@o273632.ingest.sentry.io/5630248",
  environment: "DEV"
});

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
