const { app, BrowserWindow, ipcMain, globalShortcut, ipcRenderer, dialog } = require('electron');
const url = require('url')
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const store = new Store();
Store.initRenderer();
let win;

//Fenster Parameter
 app.on('ready', () => {
   let opts = {
     minWidth: 1000,
     minHeight: 830,
     webPreferences: {
       nodeIntegration: true,
     }
   }
   Object.assign(opts, store.get('winBounds'))
   win = new BrowserWindow(opts);
   win.setMenuBarVisibility(false);
   win.loadURL(url.pathToFileURL(path.join(__dirname, 'app', 'license.html')) + '?' + process.versions.electron); //Pfad der HTML Datei + querystring

   win.once('ready-to-show', win.show)

   // Speichert beim Schließen des Programms die Höhe und die Breite des Fensters in die Electron Config
   win.on('close', () => {
     store.set('winBounds', win.getBounds())
   })

    autoUpdater.checkForUpdatesAndNotify();
 });

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});