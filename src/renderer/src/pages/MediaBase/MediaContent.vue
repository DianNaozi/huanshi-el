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

        <el-dropdown>
          <el-button text>
            默认排序<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>按时间升序</el-dropdown-item>
              <el-dropdown-item>按时间降序</el-dropdown-item>
              <el-dropdown-item>按名称排序</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="(item, index) in mediaList"
          :key="item.id"
          class="group relative cursor-pointer overflow-hidden rounded-lg"
        >
          <el-image
            :src="item.url"
            fit="cover"
            class="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
            lazy
            :initial-index="index"
            :preview-src-list="previewList"
            hide-on-click-modal
          >
            <template #placeholder>
              <div class="w-full h-full bg-gray-100 dark:bg-gray-800"></div>
            </template>
          </el-image>

          <div
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2"
          >
            <el-tooltip content="查看" placement="top">
              <el-button circle :icon="View" class="action-btn" />
            </el-tooltip>
            <el-tooltip content="下载" placement="top">
              <el-button circle :icon="Download" class="action-btn" />
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Grid, Memo, ArrowDown, View, Download } from '@element-plus/icons-vue'

// 筛选类型的数据绑定
const filterType = ref('all')
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' }
]

// 视图模式的数据绑定
const viewMode = ref('grid')

// 模拟媒体数据列表
const mediaList = ref(
  Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    name: `风景照片 ${i + 1}.jpg`,
    url: `https://picsum.photos/seed/${i + 1}/800/600`
  }))
)

// 计算属性: 为 el-image 的预览功能生成所有图片的 URL 列表
const previewList = computed(() => mediaList.value.map((item) => item.url))
</script>

<style scoped>
/* 为悬浮按钮添加特殊样式，使其在深色图片上更清晰 */
.action-btn {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(4px);
}
.action-btn:hover {
  background-color: rgba(255, 255, 255, 1) !important;
}

/* 自定义美化滚动条样式 */
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
