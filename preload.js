const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    loadPage: (page) => ipcRenderer.send('load-page', page)
});
