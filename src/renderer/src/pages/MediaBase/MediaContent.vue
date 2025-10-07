<template>
  <div class="h-full w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
    <div
      class="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0"
    >
      <div class="flex items-center gap-2">
        <button
          v-for="item in filterOptions"
          :key="item.value"
          class="px-3 py-1.5 text-sm rounded-md transition-colors duration-200"
          :class="
            filterType === item.value
              ? 'bg-blue-500 text-white font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          "
          @click="filterType = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <el-button-group>
          <el-button
            text
            :icon="Grid"
            :type="viewMode === 'grid' ? 'primary' : ''"
            @click="viewMode = 'grid'"
          />
          <el-button
            text
            :icon="Memo"
            :type="viewMode === 'list' ? 'primary' : ''"
            @click="viewMode = 'list'"
          />
        </el-button-group>
        <el-divider direction="vertical" />
        <el-dropdown @command="handleSortChange">
          <el-button text>
            {{ currentSortLabel }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="time_desc">按时间降序</el-dropdown-item>
              <el-dropdown-item command="time_asc">按时间升序</el-dropdown-item>
              <el-dropdown-item command="name_asc">按名称排序</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div
      v-if="selectedIds.size > 0"
      class="p-2 px-4 bg-blue-50 dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0 transition-all duration-300"
    >
      <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">
        已选择 {{ selectedIds.size }} 项
      </span>
      <div class="flex items-center gap-2">
        <el-button type="primary" link @click="selectAll">全部选择</el-button>
        <el-button type="danger" link @click="clearSelection">清空选择</el-button>
      </div>
    </div>

    <div
      v-loading="isLoading"
      element-loading-text="正在加载媒体资源..."
      class="flex-1 overflow-y-auto p-4"
    >
      <el-empty
        v-if="!isLoading && filteredAndSortedMedia.length === 0"
        description="暂无媒体文件"
      />

      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2"
      >
        <div
          v-for="(item, index) in filteredAndSortedMedia"
          :key="item.id"
          class="group relative cursor-pointer overflow-hidden rounded-md transition-all duration-200"
          :class="{
            'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900':
              isSelected(item.id)
          }"
          @click="handleItemClick($event, item, index)"
        >
          <el-image
            :src="`local://` + encodeURIComponent(item.thumbnailUrl)"
            fit="cover"
            class="aspect-[4/3] w-full transition-transform duration-300"
            lazy
            :preview-src-list="item.mimeType?.startsWith('image') ? imagePreviewList : []"
            :initial-index="imageIndexMap.get(item.id)"
            preview-teleported="true"
          >
            <template #placeholder>
              <div class="w-full h-full bg-gray-100 dark:bg-gray-800"></div>
            </template>
          </el-image>

          <div
            v-if="isSelected(item.id)"
            class="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <el-icon color="white" size="32"><CircleCheckFilled /></el-icon>
          </div>

          <div
            v-else
            class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <el-icon color="white" size="24"><Plus /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Grid, Memo, ArrowDown, CircleCheckFilled, Plus } from '@element-plus/icons-vue'
import type { ImportedMediaFile } from '@renderer/env' // 假设类型定义正确

// --- 状态管理 ---
const isLoading = ref(true)
const viewMode = ref('grid')
const filterType = ref('all')
const sortOrder = ref('time_desc')
const mediaList = ref<ImportedMediaFile[]>([])
const selectedIds = ref(new Set<string>())
const lastSelectedIndex = ref<number | null>(null)

// --- 静态选项 ---
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' }
]
const sortOptions = {
  time_desc: '按时间降序',
  time_asc: '按时间升序',
  name_asc: '按名称排序'
}

// --- 计算属性 ---

const filteredAndSortedMedia = computed(() => {
  // 1. 筛选
  const filtered = mediaList.value.filter((item) => {
    if (filterType.value === 'all') return true
    return item.mimeType?.startsWith(filterType.value)
  })

  // 2. 排序
  return filtered.sort((a, b) => {
    switch (sortOrder.value) {
      case 'time_asc':
        return a.time - b.time
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'time_desc':
      default:
        return b.time - a.time
    }
  })
})

const currentSortLabel = computed(() => sortOptions[sortOrder.value] || '默认排序')

// --- 为图片预览创建的计算属性 ---

const imagePreviewList = computed(() =>
  filteredAndSortedMedia.value
    .filter((item) => item.mimeType?.startsWith('image'))
    .map((item) => `local://` + encodeURIComponent(item.url))
)

const imageIndexMap = computed(() => {
  const map = new Map<string, number>()
  let imageIndex = 0
  filteredAndSortedMedia.value.forEach((item) => {
    if (item.mimeType?.startsWith('image')) {
      map.set(item.id, imageIndex)
      imageIndex++
    }
  })
  return map
})


// --- 数据获取 ---
const fetchMediaList = async () => {
  isLoading.value = true
  try {
    const data: ImportedMediaFile[] = await window.api.getAllMedia()
    mediaList.value = data
  } catch (error) {
    console.error('获取媒体数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMediaList()
})

// --- 方法 ---

const handleSortChange = (command: string) => {
  sortOrder.value = command
}

const isSelected = (id: string): boolean => selectedIds.value.has(id)

const handleItemClick = (event: MouseEvent, item: ImportedMediaFile, index: number) => {
  if (event.shiftKey && lastSelectedIndex.value !== null) {
    const start = Math.min(lastSelectedIndex.value, index)
    const end = Math.max(lastSelectedIndex.value, index)
    const rangeIds = filteredAndSortedMedia.value.slice(start, end + 1).map((m) => m.id)

    const shouldSelect = !isSelected(item.id)
    rangeIds.forEach((id) => {
      if (shouldSelect) {
        selectedIds.value.add(id)
      } else {
        selectedIds.value.delete(id)
      }
    })
  } else {
    toggleSelection(item.id)
  }
  lastSelectedIndex.value = index
}

const toggleSelection = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const selectAll = () => {
  filteredAndSortedMedia.value.forEach((item) => selectedIds.value.add(item.id))
}

const clearSelection = () => {
  selectedIds.value.clear()
  lastSelectedIndex.value = null
}
</script>

<style scoped>
/* 滚动条样式保持不变 */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
