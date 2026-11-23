const { app, BrowserWindow, dialog, ipcMain, shell, nativeTheme, Menu } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

/** Last directory the user saved a file to (in-memory, reset per session). */
let lastExportDir = null

const isDev = !app.isPackaged

app.setName('STEM QR')
app.setAppUserModelId('Stem.STEMQR')

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  })
}

function windowBackground() {
  return nativeTheme.shouldUseDarkColors ? '#0f0f0f' : '#f3f5f8'
}

function buildAppMenu(win) {
  const isMac = process.platform === 'darwin'
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Save QR…',
          accelerator: 'CmdOrCtrl+S',
          click: () => { win.webContents.send('menu:action', 'save') },
        },
        {
          label: 'Export PNG…',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => { win.webContents.send('menu:action', 'export-png') },
        },
        { type: 'separator' },
        {
          label: 'Print…',
          accelerator: 'CmdOrCtrl+P',
          click: () => { win.webContents.send('menu:action', 'print') },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    title: 'STEM QR',
    backgroundColor: windowBackground(),
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.once('ready-to-show', () => {
    win.show()
    buildAppMenu(win)
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev
      ? url.startsWith('http://127.0.0.1:5173') || url.startsWith('http://localhost:5173')
      : url.startsWith('file://')
    if (!allowed) event.preventDefault()
  })

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:5173 ws://127.0.0.1:5173; font-src 'self' data:;"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:;",
        ],
      },
    })
  })

  if (isDev) {
    void win.loadURL('http://127.0.0.1:5173')
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('save-file', async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const extension = String(payload.defaultName).split('.').pop()?.toLowerCase() || 'png'
  const locale = payload.locale === 'en' || payload.locale === 'pt' || payload.locale === 'fr'
    ? payload.locale
    : 'es'
  const copy =
    locale === 'en'
      ? {
          title: 'Save QR code',
          buttonLabel: 'Save',
          pdf: 'PDF',
          eps: 'EPS',
          svg: 'SVG',
          zip: 'ZIP',
          png: 'PNG',
          jpeg: 'JPEG',
          all: 'All files',
        }
      : locale === 'pt'
        ? {
            title: 'Salvar código QR',
            buttonLabel: 'Salvar',
            pdf: 'PDF',
            eps: 'EPS',
            svg: 'SVG',
            zip: 'ZIP',
            png: 'PNG',
            jpeg: 'JPEG',
            all: 'Todos os arquivos',
          }
        : locale === 'fr'
          ? {
              title: 'Enregistrer le code QR',
              buttonLabel: 'Enregistrer',
              pdf: 'PDF',
              eps: 'EPS',
              svg: 'SVG',
              zip: 'ZIP',
              png: 'PNG',
              jpeg: 'JPEG',
              all: 'Tous les fichiers',
            }
      : {
          title: 'Guardar código QR',
          buttonLabel: 'Guardar',
          pdf: 'PDF',
          eps: 'EPS',
          svg: 'SVG',
          zip: 'ZIP',
          png: 'PNG',
          jpeg: 'JPEG',
          all: 'Todos los archivos',
        }

  const filters =
    extension === 'pdf'
      ? [{ name: copy.pdf, extensions: ['pdf'] }]
      : extension === 'eps'
        ? [{ name: copy.eps, extensions: ['eps'] }]
        : extension === 'svg'
          ? [{ name: copy.svg, extensions: ['svg'] }]
          : extension === 'zip'
            ? [{ name: copy.zip, extensions: ['zip'] }]
          : extension === 'jpg' || extension === 'jpeg'
            ? [{ name: copy.jpeg, extensions: ['jpg', 'jpeg'] }]
            : [{ name: copy.png, extensions: ['png'] }]

  const defaultPath = lastExportDir
    ? path.join(lastExportDir, payload.defaultName)
    : payload.defaultName

  const result = await dialog.showSaveDialog(win ?? undefined, {
    title: copy.title,
    defaultPath,
    buttonLabel: copy.buttonLabel,
    filters: [...filters, { name: copy.all, extensions: ['*'] }],
  })

  if (result.canceled || !result.filePath) {
    return { saved: false }
  }

  lastExportDir = path.dirname(result.filePath)
  await fs.promises.writeFile(result.filePath, Buffer.from(payload.base64, 'base64'))
  return { saved: true, filePath: result.filePath }
})

ipcMain.handle('get-last-export-dir', () => lastExportDir ?? null)

ipcMain.handle('show-item-in-folder', async (_event, filePath) => {
  if (typeof filePath !== 'string' || !filePath.trim()) return { ok: false }
  try {
    shell.showItemInFolder(filePath)
    return { ok: true }
  } catch {
    return { ok: false }
  }
})

app.whenReady().then(() => {
  nativeTheme.themeSource = 'system'
  createWindow()

  nativeTheme.on('updated', () => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.setBackgroundColor(windowBackground())
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
