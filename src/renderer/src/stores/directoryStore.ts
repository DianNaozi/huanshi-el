import { defineStore } from 'pinia'
import { ref } from 'vue'

// FIX 1: 定义清晰的、与后端 Service 层一致的类型。
// 最好能将这个类型放到一个共享的 `types` 目录中，以便主进程和渲染进程共用。
export interface DirectoryNode {
  id: string
  parentId: string | null
  name: string
  createdAt: number
  children: DirectoryNode[]
}

// 你的 store 名称是 'directories', 与 package.json 里的 name 无关
export const useDirectoryStore = defineStore('directory', () => {
  // --- State ---
  const directoryTree = ref<DirectoryNode[]>([])
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

  // --- Actions ---

  /**
   * 从主进程获取并刷新整个目录树
   */
  async function fetchDirectoryTree(): Promise<void> {
    status.value = 'loading'
    try {
      directoryTree.value = await window.directoryApi.getTree()
      status.value = 'success'
    } catch (e) {
      console.error('Failed to fetch directory tree:', e)
      status.value = 'error'
    }
  }

  /**
   * 添加一个新目录
   * @param name - 新目录的名称
   * @param parentId - 父目录的 ID，根目录为 null
   */
  async function addDirectory(name: string, parentId: string | null): Promise<DirectoryNode> {
    status.value = 'loading'
    try {
      // 同步数据库
      const newNodeData = await window.directoryApi.create(name, parentId)

      return {
        ...newNodeData,
        children: []
      }
    } catch (e) {
      console.error('Failed to add directory:', e)
      status.value = 'error'
      // 抛出异常让 UI 层可以捕获
      throw e
    }
  }

  /**
   * 重命名一个目录
   * @param id - 要重命名的目录 ID
   * @param newName - 新的名称
   */
  async function renameDirectory(id: string, newName: string) {
    status.value = 'loading'
    try {
      await window.directoryApi.updateName(id, newName)
      await fetchDirectoryTree()
    } catch (e) {
      console.error('Failed to rename directory:', e)
      status.value = 'error'
      throw e
    }
  }

  /**
   * 删除一个目录
   * @param id - 要删除的目录 ID
   */
  async function removeDirectory(id: string) {
    status.value = 'loading'
    try {
      await window.directoryApi.delete(id)
      await fetchDirectoryTree()
    } catch (e) {
      console.error('Failed to delete directory:', e)
      status.value = 'error'
      throw e
    }
  }

  return {
    // State
    directoryTree,
    status,
    // Actions
    fetchDirectoryTree,
    addDirectory,
    renameDirectory,
    removeDirectory
  }
})
