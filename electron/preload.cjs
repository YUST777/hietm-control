const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  print: () => ipcRenderer.invoke('print-window'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onTriggerPrint: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('trigger-print', handler)
    return () => ipcRenderer.removeListener('trigger-print', handler)
  },
})
