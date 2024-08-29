import { app, BrowserWindow, ipcMain } from 'electron'
import { pathToFileURL } from 'url'
import { join } from 'path'
import updater from 'electron-updater'
import Store from 'electron-store'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { autoUpdater } = updater
const store = new Store()
let win

Store.initRenderer()

// Fenster Parameter
app.on('ready', () => {
  let opts = {
    minWidth: 1000,
    minHeight: 830,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  }
  Object.assign(opts, store.get('winBounds'))
  win = new BrowserWindow(opts)
  win.setMenuBarVisibility(false)
  win.loadURL(pathToFileURL(join(__dirname, 'app', 'index.html')) + '?' + process.versions.electron) //Pfad der HTML Datei + querystring

  win.once('ready-to-show', win.show)

  // Speichert beim Schließen des Programms die Höhe und die Breite des Fensters in die Electron Config
  win.on('close', () => {
    store.set('winBounds', win.getBounds())
  })

  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available')
})

autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox(win, {
      message: 'Update Downloaded. It will be installed on restart. Restart now?',
      buttons: ['Yes', 'No'],
      defaultId: 0,
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})
