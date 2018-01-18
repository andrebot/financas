const Window = require('../window');

const _config = {
  width: 800,
  heigth: 600
};

const MainWindow = {
  init
};

function init() {

}

module.exports = function Factory() {
  return Object.assign(Object.create(Window({ _config, pwd: __dirname })), MainWindow);
};
