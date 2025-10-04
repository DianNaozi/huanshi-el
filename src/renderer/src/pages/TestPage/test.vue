<template>
  <div class="uploader-container">
    <h2>上传媒体文件</h2>
    <div class="button-group">
      <el-button type="primary" :loading="isSingleLoading" @click="handleOpenFile">
        选择图片
      </el-button>
      <el-button type="success" :loading="isDirLoading" @click="handleOpenDirectory">
        选择文件夹
      </el-button>
    </div>

    <div v-if="uploadedFiles.length > 0" class="thumbnail-grid">
      <h3>已上传文件:</h3>
      <el-card v-for="file in uploadedFiles" :key="file.id" class="thumbnail-card" shadow="hover">
        <img
          :src="`local://` + encodeURIComponent(file.thumbnailUrl)"
          class="thumbnail-img"
          :alt="file.name"
        />
        <div class="thumbnail-info">
          <p class="file-name">{{ file.name }}</p>
          <p class="file-size">{{ (file.size / 1024).toFixed(2) }} KB</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElCard, ElMessage } from 'element-plus'
import { ImportedMediaFile } from '@renderer/env'

const isSingleLoading = ref(false)
const isDirLoading = ref(false)
const uploadedFiles = ref<ImportedMediaFile[]>([])

const handleOpenFile = async (): Promise<void> => {
  isSingleLoading.value = true
  try {
    const result: ImportedMediaFile | null = await window.api.openFile()
    if (result) {
      uploadedFiles.value.unshift(result)
      ElMessage.success(`成功上传: ${result.name}`)
    } else {
      ElMessage.info('没有选择文件或文件已存在')
    }
  } catch (error) {
    console.error('Error opening file:', error)
    ElMessage.error('上传文件时发生错误')
  } finally {
    isSingleLoading.value = false
  }
}

const handleOpenDirectory = async (): Promise<void> => {
  isDirLoading.value = true
  try {
    const results: ImportedMediaFile[] = await window.api.openDirectory()
    if (results.length > 0) {
      // unshift 将新项目添加到数组的开头
      uploadedFiles.value.unshift(...results)
      ElMessage.success(`成功上传 ${results.length} 个文件`)
    } else {
      ElMessage.info('选择的文件夹中没有新的可上传图片')
    }
  } catch (error) {
    console.error('Error opening directory:', error)
    ElMessage.error('上传文件夹时发生错误')
  } finally {
    isDirLoading.value = false
  }
}
</script>

<style scoped>
.uploader-container {
  padding: 20px;
}
.button-group {
  margin-bottom: 20px;
}
.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}
.thumbnail-card {
  text-align: center;
}
.thumbnail-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}
.thumbnail-info {
  padding: 10px;
}
.file-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 5px 0;
}
.file-size {
  font-size: 12px;
  color: #888;
  margin: 0;
}
</style>
