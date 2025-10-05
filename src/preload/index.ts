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

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
