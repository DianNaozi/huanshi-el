<template>
  <div>
    <el-tree
      ref="treeRef"
      class="media-tree"
      :data="directoryTree"
      :props="{ children: 'children', label: 'name' }"
      node-key="id"
      default-expand-all
      :expand-on-click-node="true"
      draggable
      @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextMenu"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <div class="flex items-center">
            <el-icon class="mr-2 text-gray-400" :size="20">
              <FolderOpened v-if="node.expanded" />
              <Folder v-else />
            </el-icon>

            <!--            <el-avatar size="small" :src="circleUrl" />-->

            <el-input
              v-if="editingNodeId === data.id"
              ref="renameInputRef"
              v-model="renameValue"
              class=""
              size="small"
              @blur="handleRenameConfirm(data)"
              @keyup.enter="handleRenameConfirm(data)"
            />
            <span v-else class="node-label" @dblclick="handleNodeDoubleClick(data)">
              {{ node.label }}
            </span>
          </div>

          <span class="node-count">9999999</span>
        </div>
      </template>
    </el-tree>

    <div class="px-2 mt-2">
      <el-input
        v-model="newRootName"
        placeholder="输入新目录名称后按 Enter"
        :prefix-icon="FolderAdd"
        @keyup.enter="handleConfirmRootAdd"
      />
    </div>

    <!--    右键菜单-->
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
import { ref, reactive, onMounted, nextTick } from 'vue'
// 3. 引入新图标 FolderAdd
import { Folder, FolderOpened, FolderAdd } from '@element-plus/icons-vue'
import type { ElTree, ElInput } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirectoryStore } from '@renderer/stores/directoryStore'
import { storeToRefs } from 'pinia'

// --- 类型定义 ---
interface Tree {
  id: string
  name: string
  children?: Tree[]
}

// --- 响应式状态 ---
const treeRef = ref<InstanceType<typeof ElTree>>()
const directoryStore = useDirectoryStore()
const { directoryTree } = storeToRefs(directoryStore)
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  currentNode: null as any,
  currentData: null as Tree | null
})

// 4. 为新功能添加响应式状态
const editingNodeId = ref<string | null>(null) // 正在编辑的节点ID
const renameValue = ref('') // 重命名输入框的值
const renameInputRef = ref<InstanceType<typeof ElInput> | null>(null) // 输入框的模板引用
const newRootName = ref('') // 底部新增输入框的值

// --- 事件定义 ---
const emit = defineEmits(['folder-selected'])

// --- 核心交互逻辑 ---
onMounted(() => {
  directoryStore.fetchDirectoryTree()
})

/**
 * 处理“新增目录”按钮的点击事件 (保持不变)
 */
const handleAddRootDirectory = () => {
  ElMessageBox.prompt('请输入新根目录的名称', '新增目录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '目录名称不能为空'
  })
    .then(({ value }) => {
      directoryStore.addDirectory(value, null).then(() => {
        ElMessage.success(`根目录 "${value}" 创建成功`)
      })
    })
    .catch(() => {})
}

/**
 * 5. 新增函数：处理底部输入框的回车事件
 */
const handleConfirmRootAdd = (): void => {
  const name = newRootName.value.trim()
  if (!name) {
    ElMessage.warning('目录名称不能为空')
    return
  }
  directoryStore.addDirectory(name, null).then(() => {
    ElMessage.success(`根目录 "${name}" 创建成功`)
    newRootName.value = '' // 成功后清空输入框
  })
}

/**
 * 6. 新增函数：处理节点双击事件，进入编辑状态
 */
const handleNodeDoubleClick = (data: Tree) => {
  editingNodeId.value = data.id
  renameValue.value = data.name
  // 使用 nextTick 确保 input 元素已被渲染，然后自动聚焦
  nextTick(() => {
    renameInputRef.value?.focus()
  })
}

/**
 * 7. 新增函数：处理重命名确认（失焦或回车）
 */
const handleRenameConfirm = (data: Tree) => {
  // 如果不在编辑状态，直接返回（防止blur和enter重复触发）
  if (editingNodeId.value === null) return

  const newName = renameValue.value.trim()
  editingNodeId.value = null // 立即退出编辑状态，让UI变回文本

  // 如果名称为空或未改变，则不执行任何操作
  if (!newName || newName === data.name) {
    return
  }

  directoryStore.renameDirectory(data.id, newName).then(() => {
    ElMessage.success(`已重命名为 "${newName}"`)
  })
}

// --- 其他函数保持不变 ---
const handleNodeClick = (data: Tree) => {
  // 单击时如果正在编辑其他节点，则取消编辑
  if (editingNodeId.value !== null && editingNodeId.value !== data.id) {
    handleRenameConfirm({ id: editingNodeId.value, name: '' }) // 传入一个虚拟data来触发失焦逻辑
  }
  emit('folder-selected', data.id)
  if (contextMenu.visible) contextMenu.visible = false
}

const handleNodeContextMenu = (event: MouseEvent, data: Tree, node: any) => {
  event.preventDefault()
  treeRef.value?.setCurrentKey(data.id)
  contextMenu.currentNode = node
  contextMenu.currentData = data
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.visible = true
}

// 1. 必须将函数声明为 async
const handleAppend = async () => {
  // 2. 获取父节点（el-tree node 对象或 node-key）
  // contextMenu.currentNode 是 el-tree 的 node 对象，这是正确的
  const parentNode = contextMenu.currentNode

  // 隐藏菜单
  contextMenu.visible = false

  try {
    // 3. 使用 await 等待 store 方法执行完毕
    //    我假设 addDirectory 会返回新创建的节点数据
    const newNodeData = await directoryStore.addDirectory('新文件夹', parentNode?.id ?? null)

    // 4. 确保 store 真的返回了数据
    // 5. 构造要 append 的新节点数据，确保它有 children 数组
    const newChild = {
      ...newNodeData
    }

    // 6. 使用真实的数据 newChild 进行 append
    treeRef.value?.append(newChild, parentNode)
    ElMessage.success(`目录创建成功`)
  } catch (error) {
    console.error('Add directory failed:', error)
    ElMessage.error('创建失败')
  }
}

const handleRename = () => {
  const data = contextMenu.currentData
  if (data) {
    // 右键重命名直接触发双击逻辑，统一交互
    handleNodeDoubleClick(data)
  }
  contextMenu.visible = false
}

const handleRemove = () => {
  /* ... */
}
</script>

<style scoped>
.media-tree :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 0 18px 18px 0;
  transition: background-color 0.2s ease;
}

.media-tree :deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.media-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
}

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
  font-size: 13px;
  font-weight: 500;
  color: #909399;
  padding-right: 18px;
}

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
