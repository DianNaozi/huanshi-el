<template>
  <div class="h-screen flex flex-col select-none">
    <TopBar></TopBar>

    <div class="flex h-[calc(100%-60px)]">
      <div class="flex h-full flex-col" :style="{ width: leftMenuWidth + 'px' }">
        <LeftMenu></LeftMenu>
      </div>

      <!--      分割线-->
      <div class="h-full w-1 flex justify-center cursor-col-resize group" @mousedown="startDrag">
        <div
          class="h-full w-px bg-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        ></div>
      </div>

      <div class="bg-cyan-200 flex-1">
        <MediaContent></MediaContent>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from '@renderer/pages/MediaBase/TopBar.vue'
import LeftMenu from '@renderer/pages/MediaBase/LeftMenu.vue'
import MediaContent from '@renderer/pages/MediaBase/MediaContent.vue'
import { onUnmounted, ref } from 'vue'

// --- 状态定义 ---

// 左侧菜单的响应式宽度
const leftMenuWidth = ref(250) // 初始宽度
// 标记是否正在拖拽
const isDragging = ref(false)
// 拖拽起始时鼠标的X坐标
const startX = ref(0)
// 拖拽起始时菜单的宽度
const startWidth = ref(0)

// --- 范围约束 ---

const MIN_WIDTH = 150 // 菜单最小宽度
const MAX_WIDTH = 600 // 菜单最大宽度

// --- 事件处理函数 ---

/**
 * 鼠标按下，开始拖拽
 */
const startDrag = (event: MouseEvent): void => {
  // 阻止默认行为，例如拖拽时选中文字
  event.preventDefault()

  isDragging.value = true
  startX.value = event.clientX // 记录鼠标初始位置
  startWidth.value = leftMenuWidth.value // 记录菜单初始宽度

  // 在 window 上添加事件监听器
  window.addEventListener('mousemove', doDrag)
  window.addEventListener('mouseup', stopDrag)
}

/**
 * 鼠标移动，执行拖拽
 */
const doDrag = (event: MouseEvent): void => {
  if (!isDragging.value) return

  const deltaX = event.clientX - startX.value // 计算鼠标移动的距离
  let newWidth = startWidth.value + deltaX

  // 应用范围约束
  if (newWidth < MIN_WIDTH) {
    newWidth = MIN_WIDTH
  } else if (newWidth > MAX_WIDTH) {
    newWidth = MAX_WIDTH
  }

  leftMenuWidth.value = newWidth
}

/**
 * 鼠标松开，结束拖拽
 */
const stopDrag = (): void => {
  if (isDragging.value) {
    isDragging.value = false

    // 移除 window 上的事件监听器
    window.removeEventListener('mousemove', doDrag)
    window.removeEventListener('mouseup', stopDrag)
  }
}

// --- 生命周期钩子 ---
// 确保在组件卸载时清理掉事件监听器，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('mousemove', doDrag)
  window.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped></style>
