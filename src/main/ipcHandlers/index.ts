// 导出一个总的注册函数
import { registerMediaHandlers } from './mediaHandler'
import { registerDirectoryHandlers } from './directoryHandler'

export function registerAllIpcHandlers(): void {
  console.log('Registering all IPC handlers...')

  // 在这里调用所有模块的注册函数
  registerMediaHandlers()
  registerDirectoryHandlers()

  console.log('All IPC handlers registered.')
}
