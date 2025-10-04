import { app, BrowserWindow, protocol } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './windows/mainWindow'
import { registerAllIpcHandlers } from './ipcHandlers'
import { initializeDatabase } from './database/connection'
import path from 'path'

app.whenReady().then(() => {
  // 3. 在 app ready 之后，注册我们的自定义协议
  protocol.registerFileProtocol('local', (request, callback) => {
    const url = request.url.replace('local://', '')
    try {
      const decodedPath = decodeURIComponent(url)
      const safePath = path.normalize(decodedPath)
      return callback(safePath)
    } catch (error) {
      console.error('Failed to handle "local" protocol request:', error)
      return callback({ error: -2, path: '' }) // Corresponds to net::ERR_FAILED
    }
  })

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 2. 注册所有 IPC 处理器
  registerAllIpcHandlers()

  // 在这里调用数据库初始化函数
  initializeDatabase()

  // 3. 创建主窗口
  createMainWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
