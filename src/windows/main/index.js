const { Menu, MenuItem } = require('electron');
const Window = require('../window');
const CreateBankWindow = require('../createBank');

const _config = {
  width: 800,
  heigth: 600
};

const createBankWindow = CreateBankWindow();
let mainMenu;

const MainWindow = {
  init
};

function init() {
  mainMenu = Menu.getApplicationMenu();
  mainMenu.insert(1, new MenuItem({
    label: 'Bank',
    submenu: [
      {
        label: 'New...',
        click: openNewBankWindow
      }
    ]
  }));

  Menu.setApplicationMenu(mainMenu);
}

function openNewBankWindow() {
  createBankWindow.init();
  createBankWindow.open(true);
}

module.exports = function Factory() {
  return Object.assign(Object.create(Window({ _config, pwd: __dirname })), MainWindow);
};
