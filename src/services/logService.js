//import Raven from "raven-js";

function init() {
  //Add config
}

function log(error) {
  //Raven.captureException(error);
  console.log(error);
}

export default {
  init,
  log
};
