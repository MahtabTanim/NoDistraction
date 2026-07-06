const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  updateTrayTitle: (title) => ipcRenderer.send('update-tray-title', title),
  quitApp: () => ipcRenderer.send('quit-app'),
  hideWindow: () => ipcRenderer.send('hide-window'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, data) => callback(data)),
  onGlobalAction: (callback) => {
    ipcRenderer.removeAllListeners('global-action');
    ipcRenderer.on('global-action', (event, action) => callback(action));
  },
  openUpdateLink: (url) => ipcRenderer.send('open-update-link', url),
});
