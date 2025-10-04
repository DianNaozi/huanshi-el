<template>
  <div
    class="w-full flex items-center justify-between bg-white px-6 box-border h-[60px] border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="flex items-center gap-x-4 mr-4">
      <div
        class="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      >
        <el-icon :size="'20px'">
          <Edit />
        </el-icon>
      </div>
      <el-text size="large" type="primary" style="font-weight: 600">Primary</el-text>
    </div>

    <div class="flex-1">
      <el-input-tag
        v-model="input"
        style="width: 500px"
        clearable
        :clear-icon="CloseBold"
        placeholder="搜索..."
        size="large"
      >
        <template #prefix>
          <el-icon :size="'17px'"><Search /></el-icon>
        </template>
      </el-input-tag>
    </div>

    <div class="flex items-center gap-x-4">
      <div
        class="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      >
        <el-icon :size="'20px'">
          <Edit />
        </el-icon>
      </div>
      <div
        class="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      >
        <el-icon :size="'20px'">
          <Edit />
        </el-icon>
      </div>
      <div class="flex items-center gap-x-2 cursor-pointer">
        <el-avatar :src="circleUrl" />
        <el-text size="large">Large</el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 优化 #6: 移除了未使用的 ElementPlus 图标
import { CloseBold, Edit, Search } from '@element-plus/icons-vue'
import { ref } from 'vue'

const input = ref<string[]>()
const circleUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
</script>

<style scoped></style>
