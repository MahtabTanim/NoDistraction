const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  updateTrayTitle: (title) => ipcRenderer.send('update-tray-title', title),
  quitApp: () => ipcRenderer.send('quit-app'),
  hideWindow: () => ipcRenderer.send('hide-window'),
});
