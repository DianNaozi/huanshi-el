import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openFile: () => ipcRenderer.invoke('open-file'),

  openDirectory: () => ipcRenderer.invoke('open-directory'),

  uploadDroppedFiles: (files) => {
    const filePaths: string[] = []
    const keys = Object.keys(files)
    keys.forEach((key) => {
      const file = files[key]
      const path = webUtils.getPathForFile(file)
      filePaths.push(path)
    })

    ipcRenderer.invoke('upload-dropped-files', filePaths)
    console.log(filePaths, '上传路径')
    return Promise.resolve([])
  },

  getDragFilePath: (file) => {
    const path = webUtils.getPathForFile(file)
    return path
  },

  getAllMedia: () => ipcRenderer.invoke('get-all-media')
}

// 2. 在这里定义我们之前讨论过的、专门用于目录操作的 API
//    它的方法名和参数，与我们的 directoryHandler 和 directoryStore 完全对应
export const directoryApi = {
  create: (name: string, parentId: string | null) =>
    ipcRenderer.invoke('directory:create', name, parentId),
  getTree: () => ipcRenderer.invoke('directory:getTree'),
  updateName: (id: string, newName: string) =>
    ipcRenderer.invoke('directory:updateName', id, newName),
  delete: (id: string) => ipcRenderer.invoke('directory:delete', id)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('directoryApi', directoryApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.directoryApi = directoryApi
}
