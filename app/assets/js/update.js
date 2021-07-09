const { ipcRenderer, remote } = require('electron');
const dialog   = remote.dialog;

let win = remote.getCurrentWindow()

ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available');
  alert('A new update is available. Downloading now...');
});

ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
   dialog.showMessageBox(
    win,
    {
      message: "Update Downloaded. It will be installed on restart. Restart now?",
      buttons: ["Yes", "No"],
      defaultId: 0,
    })
    .then(result => {
      if (result.response === 0) {
        restartApp();
      } else if (result.response === 1) {}
    }
  );
});

function restartApp() {
  ipcRenderer.send('restart_app');
}