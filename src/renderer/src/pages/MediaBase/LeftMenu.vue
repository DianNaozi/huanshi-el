<template>
  <div class="h-full flex flex-col bg-white overflow-y-auto box-border p-2">
    <div class="flex flex-col flex-shrink-0">
      <el-segmented v-model="value" :options="options" direction="vertical" class="w-full">
        <template #default="{ item }">
          <div class="flex items-center gap-2">
            <el-icon size="20">
              <component :is="item.icon" />
            </el-icon>
            <div class="flex-1 text-left">{{ item.label }}</div>
            <div class="">1</div>
          </div>
        </template>
      </el-segmented>
    </div>

    <el-divider class="flex-shrink-0" />

    <div class="flex-1">
      <MediaCollectionTree></MediaCollectionTree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Apple, Cherry, Grape, Orange, Pear, Watermelon } from '@element-plus/icons-vue'
import { ref } from 'vue'
import MediaCollectionTree from '@renderer/pages/MediaBase/component/MediaCollectionTree.vue'

const value = ref('Apple')

const options = [
  {
    label: '所有媒体',
    value: 'AllMedia',
    icon: Apple
  },
  {
    label: '未分类',
    value: 'NotSort',
    icon: Cherry
  },
  {
    label: 'Grape',
    value: 'Grape',
    icon: Grape
  },
  {
    label: 'Orange',
    value: 'Orange',
    icon: Orange
  },
  {
    label: 'Pear',
    value: 'Pear',
    icon: Pear
  },
  {
    label: 'Watermelon',
    value: 'Watermelon',
    icon: Watermelon
  }
]


</script>

<style scoped>
/* 穿透 el-tree 组件的内部样式，进行美化 */
:deep(.el-tree-node__content) {
  border-radius: 6px; /* 为每个节点添加圆角 */
  margin: 2px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f3f4f6; /* 使用 Tailwind gray-100 作为悬浮背景色 */
}

/* 优化 el-segmented 选中项的样式 */
:deep(.el-segmented__item.is-selected) {
  border-radius: 6px !important;
}

/* --- 美化滚动条样式 (保留) --- */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
