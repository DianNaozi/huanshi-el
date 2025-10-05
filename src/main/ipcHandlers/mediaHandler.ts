// src/main/ipcHandlers/mediaHandler.ts
import { BrowserWindow, dialog, ipcMain, IpcMainInvokeEvent } from 'electron'
import { getAllMedia, processMediaFile } from '../services/mediaService'
import fs from 'fs/promises'
import path from 'path'

export function registerMediaHandlers(): void {
  // 处理单个文件上传
  ipcMain.handle('open-file', async (event: IpcMainInvokeEvent) => {
    // 弹出框置顶
    const win: Electron.BrowserWindow | null = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
    })

    if (canceled || filePaths.length === 0) {
      return null
    }

    // The 'await' here is not strictly necessary, as async functions
    // automatically handle returned promises, but it's fine to leave it.
    return await processMediaFile(filePaths[0])
  })

  // 处理文件夹上传:并行上传
  ipcMain.handle('open-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (canceled || filePaths.length === 0) {
      return []
    }

    const dirPath = filePaths[0]
    const filesInDir = await fs.readdir(dirPath)

    // 1. 创建一个包含所有文件处理任务（Promise）的数组
    const processingPromises = filesInDir.map((file) => {
      const filePath = path.join(dirPath, file)
      // 立即调用 processMediaFile，它会返回一个 Promise
      return processMediaFile(filePath)
    })

    // 2. 使用 Promise.all 等待所有任务完成
    const allResults = await Promise.all(processingPromises)

    // 3. 过滤掉失败的结果（返回值为 null 的）
    const successfulResults = allResults.filter((result) => result !== null)

    return successfulResults
  })

  // 处理拖拽上传的文件
  ipcMain.handle('upload-dropped-files', async (_event, filePaths: string[]) => {
    console.log(filePaths)
    if (!filePaths || filePaths.length === 0) {
      return []
    }

    const results = []
    for (const filePath of filePaths) {
      // 复用我们强大的 processMediaFile 函数
      const result = await processMediaFile(filePath)
      if (result) {
        results.push(result)
      }
    }
    return results
  })

  // TODO 分页
  // 获取所有媒体文件
  ipcMain.handle('get-all-media', async () => {
    return await getAllMedia()
  })
}
