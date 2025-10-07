import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 使用 setup store 风格，更接近 Vue 3 Composition API 的习惯
export const useDirectoryStore = defineStore('directories', () => {
  // --- State ---
  const directories = ref<Tree[]>([]) // 你的 Tree 接口
  const selectedDirectoryId = ref<string | null>(null)
  const status = ref('idle') // 'idle', 'loading', 'success', 'error'

  // --- Getters ---
  const selectedDirectory = computed(() => {
    // 可以在这里写一个递归查找函数，根据 ID 返回整个目录对象
    return findDirectoryById(directories.value, selectedDirectoryId.value)
  })

  // --- Actions ---
  async function fetchDirectories() {
    status.value = 'loading'
    try {
      // 假设你有一个通过 IPC 调用主进程数据库查询的方法
      const result = await window.electron.ipcRenderer.invoke('db:get-directories')
      directories.value = result
      status.value = 'success'
    } catch (e) {
      status.value = 'error'
    }
  }

  function selectDirectory(id: string) {
    selectedDirectoryId.value = id

    // 在这里可以触发 mediaStore 的加载
    const mediaStore = useMediaStore() // 动态导入，避免循环依赖
    mediaStore.fetchMediaForDirectory(id)
  }

  return {
    directories,
    selectedDirectoryId,
    status,
    selectedDirectory,
    fetchDirectories,
    selectDirectory
  }
})
