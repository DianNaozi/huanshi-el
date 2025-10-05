<template>
  <div class="uploader-container">
    <h2>上传媒体文件</h2>
    <div class="button-group"></div>

    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <p>将文件或文件夹拖拽到这里</p>
    </div>
    <div v-if="uploadedFiles.length > 0" class="thumbnail-grid"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ImportedMediaFile } from '@renderer/env'

const isSingleLoading = ref(false)
const isDirLoading = ref(false)
const uploadedFiles = ref<ImportedMediaFile[]>([])

// ... handleOpenFile 和 handleOpenDirectory 方法不变 ...

// ==================> 新增：处理拖拽状态和事件 <==================
const isDragging = ref(false)

// 必须阻止 dragenter 和 dragover 事件的默认行为，否则浏览器会自动打开文件
const handleDragEnter = (e: DragEvent): void => {
  isDragging.value = true
}
const handleDragOver = (e: DragEvent): void => {
  // 持续触发，保持拖拽状态
  isDragging.value = true
}
const handleDragLeave = (e: DragEvent): void => {
  isDragging.value = false
}

// 文件被放下时触发的核心处理函数
const handleDrop = async (e: DragEvent): Promise<void> => {
  isDragging.value = false
  isDirLoading.value = true // 开始处理，显示 loading 状态

  // 1. 从拖拽事件中获取文件列表
  if (!e.dataTransfer?.files) {
    isDirLoading.value = false
    return
  }

  try {
    const results = await window.api.uploadDroppedFiles(e.dataTransfer.files)
    if (results.length > 0) {
      uploadedFiles.value.unshift(...results)
      ElMessage.success(`成功拖拽上传 ${results.length} 个文件`)
    } else {
      ElMessage.info('拖拽的文件中没有新的可上传图片')
    }
  } catch (error) {
    console.error('Error handling dropped files:', error)
    ElMessage.error('处理拖拽文件时发生错误')
  } finally {
    isDirLoading.value = false // 无论成功或失败，最后都关闭 loading 状态
  }
}
// ========================================================
</script>

<style scoped>
/* ... 其他样式不变 ... */

/* ==================> 新增：拖拽区域的样式 <================== */
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #888;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  margin-top: 20px;
}
.drop-zone.is-dragging {
  border-color: #409eff;
  background-color: #ecf5ff;
}
/* ======================================================== */
</style>
