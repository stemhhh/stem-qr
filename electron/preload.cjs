const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('qrDesktop', {
  isDesktop: true,
  saveFile: (payload) => ipcRenderer.invoke('save-file', payload),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
  getLastExportDir: () => ipcRenderer.invoke('get-last-export-dir'),
  onMenuAction: (callback) => {
    const handler = (_event, action) => callback(action)
    ipcRenderer.on('menu:action', handler)
    return () => ipcRenderer.removeListener('menu:action', handler)
  },
})
