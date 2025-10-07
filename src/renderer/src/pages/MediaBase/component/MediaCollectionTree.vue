<template>
  <div>
    <el-input v-model="filterText" placeholder="筛选目录" />

    <el-tree
      ref="treeRef"
      class="media-tree"
      :data="dataSource"
      node-key="id"
      default-expand-all
      :expand-on-click-node="true"
      @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextMenu"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <div class="node-content-left">
            <el-icon class="node-icon" :size="20">
              <FolderOpened v-if="node.expanded" />
              <Folder v-else />
            </el-icon>
            <span class="node-label">{{ node.label }}</span>
          </div>

          <div class="node-content-right">
            <span class="node-count">1</span>
          </div>
        </div>
      </template>
    </el-tree>

    <div
      v-if="contextMenu.visible"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="context-menu"
      @mouseleave="contextMenu.visible = false"
    >
      <ul class="context-menu-list">
        <li @click="handleAppend">新建文件夹</li>
        <li @click="handleRename">重命名</li>
        <li @click="handleRemove">删除</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Folder, FolderOpened } from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 类型定义 ---
interface Tree {
  id: string // ID 改为 string, 与数据库设计一致
  label: string
  children?: Tree[]
}

// --- 响应式状态 ---
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
const dataSource = ref<Tree[]>([
  // ... 示例数据 ...
  { id: '1', label: '我的媒体库', children: [{ id: '4', label: '设计素材', children: [{ id: '9', label: 'UI Kits' }, { id: '10', label: '灵感截图' }] }] },
  { id: '2', label: '项目 A', children: [{ id: '5', label: '原始文件' }, { id: '6', label: '导出成品' }] },
  { id: '3', label: '收藏', children: [{ id: '7', label: '摄影作品' }, { id: '8', label: '插画' }] }
])
// 右键菜单的状态
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  currentNode: null as any, // 保存当前右键点击的节点信息
  currentData: null as Tree | null
})

// --- 事件定义 ---
// 定义组件要触发的事件
const emit = defineEmits(['folder-selected'])

// --- 核心交互逻辑 ---

/**
 * 节点单击事件处理
 * @param data - 点击的节点数据
 */
const handleNodeClick = (data: Tree) => {
  console.log('Selected Folder:', data)
  // 触发事件，通知父组件文件夹已被选中
  emit('folder-selected', data.id)
  // 如果右键菜单是可见的，则隐藏它
  if (contextMenu.visible) {
    contextMenu.visible = false
  }
}

/**
 * 节点右键菜单事件处理
 * @param event - 鼠标事件
 * @param data - 节点数据
 * @param node - 节点实例
 */
const handleNodeContextMenu = (event: MouseEvent, data: Tree, node: any) => {
  event.preventDefault() // 阻止默认的浏览器右键菜单

  // 设置当前选中的节点，用于后续操作
  treeRef.value?.setCurrentKey(data.id)

  contextMenu.currentNode = node
  contextMenu.currentData = data

  // 定位并显示自定义菜单
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.visible = true
}

// --- 右键菜单操作 ---

// 新建文件夹
const handleAppend = () => {
  const data = contextMenu.currentData
  if (!data) return

  ElMessageBox.prompt('请输入新文件夹的名称', '新建文件夹', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '文件夹名称不能为空'
  }).then(({ value }) => {
    const newChild: Tree = { id: new Date().getTime().toString(), label: value, children: [] }
    if (!data.children) {
      data.children = []
    }
    data.children.push(newChild)
    dataSource.value = [...dataSource.value]
    ElMessage.success(`文件夹 "${value}" 创建成功`)
  }).catch(() => {}) // 捕获取消操作

  contextMenu.visible = false
}

// 重命名
const handleRename = () => {
  const data = contextMenu.currentData
  if (!data) return

  ElMessageBox.prompt('请输入新的文件夹名称', '重命名', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: data.label,
    inputPattern: /.+/,
    inputErrorMessage: '文件夹名称不能为空'
  }).then(({ value }) => {
    data.label = value
    ElMessage.success(`已重命名为 "${value}"`)
  }).catch(() => {})

  contextMenu.visible = false
}

// 删除文件夹
const handleRemove = () => {
  const node = contextMenu.currentNode
  const data = contextMenu.currentData
  if (!node || !data) return

  ElMessageBox.confirm(`确定要删除文件夹 "${data.label}" 吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const parent = node.parent
    const children: Tree[] = parent.data.children || parent.data
    const index = children.findIndex((d) => d.id === data.id)
    children.splice(index, 1)
    dataSource.value = [...dataSource.value]
    ElMessage.success(`文件夹 "${data.label}" 已删除`)
  }).catch(() => {})

  contextMenu.visible = false
}
</script>

<style scoped>
.media-tree {
  margin-top: 12px;
}

/* --- CSS 核心修复区域 --- */

/* 1. 统一设置节点高度和基础样式 */
.media-tree :deep(.el-tree-node__content) {
  height: 44px;
  border-radius: 4px; /* 为 hover 和 active 状态提供圆角背景 */
  transition: background-color 0.2s ease;
}

/* 2. 直接在 el-tree-node__content 上定义清晰的 hover 效果 */
/* 这样可以确保整个可交互区域都有统一、无冲突的 hover 响应 */
.media-tree :deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

/* 3. 定义选中状态的样式 */
/* 由于 .is-current 的 CSS 优先级更高，它会正确地覆盖 hover 状态，无需!important */
.media-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
}

/* --- 其他样式保持不变 --- */

.custom-tree-node {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.node-content-left {
  display: flex;
  align-items: center;
}

.node-icon {
  margin-right: 8px;
  color: #909399;
}

.media-tree :deep(.el-tree-node.is-current > .el-tree-node__content .node-icon) {
  color: var(--el-color-primary);
}

.node-label {
  font-size: 15px;
  color: #303133;
}

.node-count {
  font-size: 12px;
  font-weight: 500;
  color: #909399;
  background-color: #e9e9eb;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 自定义右键菜单样式 */
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  padding: 5px 0;
}

.context-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.context-menu-list li {
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.context-menu-list li:hover {
  background-color: #f5f7fa;
  color: var(--el-color-primary);
}
</style>
