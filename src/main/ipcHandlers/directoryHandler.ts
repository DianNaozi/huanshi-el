import { ipcMain } from 'electron'
import * as directoryService from '../services/directoryService'

export function registerDirectoryHandlers(): void {
  ipcMain.handle('directory:create', (_, name: string, parentId: string | null) => {
    return directoryService.createDirectory(name, parentId)
  })

  ipcMain.handle('directory:getTree', () => {
    return directoryService.getDirectoryTree()
  })

  ipcMain.handle('directory:updateName', (_, id: string, newName: string) => {
    return directoryService.updateDirectoryName(id, newName)
  })

  ipcMain.handle('directory:delete', async (_, id: string) => {
    await directoryService.deleteDirectory(id)
    // IPC 调用成功后可以返回一个状态
    return { success: true }
  })
}
