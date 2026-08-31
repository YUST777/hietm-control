const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('path')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1024,
    minHeight: 650,
    show: false,
    title: 'نظام الكنترول والمراقبات | المعهد العالي للهندسة والتكنولوجيا',
    icon: path.join(__dirname, process.platform === 'win32' ? '../public/icon.ico' : '../public/icon.png'),
    backgroundColor: '#f7f7f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(0.75)
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  setupMenu()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupMenu() {
  const isMac = process.platform === 'darwin'
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Print Report / طباعة التقرير',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('trigger-print')
            }
          },
        },
        { type: 'separator' },
        { role: isMac ? 'close' : 'quit', label: 'Exit / خروج' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload / إعادة تحميل' },
        { role: 'forceReload', label: 'Force Reload' },
        { type: 'separator' },
        {
          label: 'Zoom Out (75%) / تصغير العرض',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) mainWindow.webContents.setZoomFactor(1.1)
          },
        },
        { role: 'zoomIn', label: 'Zoom In / تكبير' },
        { role: 'zoomOut', label: 'Zoom Out / تصغير' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Full Screen / ملء الشاشة' },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

ipcMain.handle('print-to-pdf', async (_event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'Window not available' }
  try {
    const data = await mainWindow.webContents.printToPDF({
      landscape: true,
      pageSize: 'A4',
      printBackground: true,
      ...options,
    })
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
