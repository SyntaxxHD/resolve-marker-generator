const { ipcRenderer } = require('electron')

ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available')
  alert(langUpdateAvailable)
})