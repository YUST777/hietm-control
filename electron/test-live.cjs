const { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    title: 'نظام الكنترول والمراقبات | المعهد العالي للهندسة',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  win.loadURL('https://girges-sidhom.github.io/hietm.control/')
})
