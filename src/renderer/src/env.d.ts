// 1. 首先，定义你的 ImportedMediaFile 类型。
// 这个类型应该和你主进程返回的数据结构完全对应。
// 由于渲染进程不能直接引用主进程的 TypeScript 类型，我们在这里重新声明一次。
export interface ImportedMediaFile {
  id: string
  hashId: string | null
  name: string
  ext: string
  width: number
  height: number
  size: number
  score: number
  time: number
  revisionTime: number
  note: string | null
  url: string | null
  thumbnailUrl: string // 这是从主进程返回给前端的关键字段
  palettes: string | null
  author: string | null
  comments: string | null
  isDeleted: number
}

// 2. 使用 declare global 扩展全局的 Window 接口
declare global {
  interface Window {
    // 在这里定义你通过 contextBridge 暴露的所有 API
    api: {
      openFile: () => Promise<ImportedMediaFile | null>
      openDirectory: () => Promise<ImportedMediaFile[]>
      // 如果未来有更多 API，继续在这里添加
    }
  }
}

// 为了防止 TypeScript 报错“无法重新声明块范围变量”，
// 添加一个空的 export {} 语句，告诉 TypeScript 这是一个模块文件。
export {}
