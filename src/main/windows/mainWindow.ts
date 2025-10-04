// src/main/windows/mainWindow.ts

import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

// 1. 在模块作用域内维护一个窗口实例变量
let mainWindow: BrowserWindow | null = null

// 2. 导出获取窗口实例的函数，供其他模块使用
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function createMainWindow(): void {
  // 3. 实现单例模式：如果窗口已存在，则聚焦它而不是创建新的
  if (mainWindow) {
    mainWindow.focus()
    return
  }

  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 4. 管理窗口的生命周期
  mainWindow.on('closed', () => {
    // 当窗口关闭时，将实例设置为 null，以便垃圾回收和重新创建
    mainWindow = null
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
