const { app, ipcMain } = require('electron');
const MainWindow = require('./windows/main');

const mainWindow = MainWindow();

app.on('ready', function () {
  mainWindow.init(ipcMain);
  mainWindow.open(true);
});

app.on('window-all-closed', function () {
  app.quit();
});
