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
      <el-dropdown trigger="click" @command="handleCommand">
        <div
          class="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
        >
          <el-icon :size="'20px'">
            <Upload />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="importMediaFiles">
              <el-icon :size="20">
                <DocumentAdd />
              </el-icon>
              <span>导入本地文件</span>
            </el-dropdown-item>
            <el-dropdown-item command="importFold">
              <el-icon :size="20">
                <Folder />
              </el-icon>
              <span> 导入本地文件夹 </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

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
import { CloseBold, DocumentAdd, Edit, Folder, Search, Upload } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { ImportedMediaFile } from '@renderer/env'
import { ElMessage } from 'element-plus'

const input = ref<string[]>()
const circleUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const handleCommand = async (command: string | number | object): Promise<void> => {
  if (command === 'importMediaFiles') {
    // 导入媒体
    try {
      const result: ImportedMediaFile | null = await window.api.openFile()
      if (result) {
        // TODO 上传成功后的返回处理 自己写一个交互从地下弹出进度条
        ElMessage.success(`成功上传: ${result}`)
      } else {
        ElMessage.info('没有选择文件或文件已存在')
      }
    } catch (error) {
      console.error('Error opening file:', error)
      ElMessage.error('上传文件时发生错误')
    } finally {
    }
  } else if (command === 'importFold') {
    // 导入文件夹
    // TODO 导入后的前端样式以及相关显示处理
    try {
      const results: ImportedMediaFile[] = await window.api.openDirectory()
      if (results.length > 0) {
        // unshift 将新项目添加到数组的开头
        ElMessage.success(`成功上传 ${results.length} 个文件`)
      } else {
        ElMessage.info('选择的文件夹中没有新的可上传图片')
      }
    } catch (error) {
      console.error('Error opening directory:', error)
      ElMessage.error('上传文件夹时发生错误')
    } finally {
    }
  }
}
</script>

<style scoped></style>
