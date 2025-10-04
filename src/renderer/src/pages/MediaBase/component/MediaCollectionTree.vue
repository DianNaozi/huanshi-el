<template>
  <el-input v-model="filterText" placeholder="Filter keyword" />

  <el-tree
    :data="dataSource"
    node-key="id"
    default-expand-all
    :expand-on-click-node="false"
    :props="{ class: customNodeClass }"
  >
    <template #default="{ node, data }">
      <div class="flex-1 flex items-center justify-between pr-2">
        <span>{{ node.label }}</span>
        <span>
          <!--          <a @click="append(data)"> Append </a>-->
          <!--          <a @click="remove(node, data)"> Delete </a>-->
          1
        </span>
      </div>
    </template>
  </el-tree>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tree {
  id: number
  label: string
  children?: Tree[]
}
let id = 1000

const filterText = ref('')

const customNodeClass = (data: Tree, node: Node) => {
  if (data.isPenultimate) {
    return 'is-penultimate'
  }
  return null
}

const append = (data: Tree) => {
  const newChild = { id: id++, label: 'testtest', children: [] }
  if (!data.children) {
    data.children = []
  }
  data.children.push(newChild)
  dataSource.value = [...dataSource.value]
}

const remove = (node: Node, data: Tree) => {
  const parent = node.parent
  const children: Tree[] = parent.data.children || parent.data
  const index = children.findIndex((d) => d.id === data.id)
  children.splice(index, 1)
  dataSource.value = [...dataSource.value]
}

const dataSource = ref<Tree[]>([
  {
    id: 1,
    label: 'Level one 1',
    children: [
      {
        id: 4,
        label: 'Level two 1-1',
        children: [
          {
            id: 9,
            label: 'Level three 1-1-1'
          },
          {
            id: 10,
            label: 'Level three 1-1-2'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    label: 'Level one 2',
    children: [
      {
        id: 5,
        label: 'Level two 2-1'
      },
      {
        id: 6,
        label: 'Level two 2-2'
      }
    ]
  },
  {
    id: 3,
    label: 'Level one 3',
    children: [
      {
        id: 7,
        label: 'Level two 3-1'
      },
      {
        id: 8,
        label: 'Level two 3-2'
      }
    ]
  }
])
</script>

<style scoped></style>
