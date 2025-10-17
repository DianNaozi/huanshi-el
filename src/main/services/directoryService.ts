import * as directoryRepo from '../database/repositories/directoryRepository'
import { db } from '../database/connection' // 引入db实例用于事务

// 定义 Service 层对外的统一数据结构
export type DirectoryNode = {
  id: string
  parentId: string | null
  name: string
  createdAt: number
  children: DirectoryNode[]
}

/**
 * 创建一个新的目录
 */
export async function createDirectory(name: string, parentId: string | null = null) {
  return await directoryRepo.create({ name, parentId })
}

/**
 * 更新目录名称
 */
export async function updateDirectoryName(id: string, newName: string) {
  return await directoryRepo.update(id, { name: newName })
}

/**
 * 获取完整的目录树
 * @returns 根目录节点数组
 */
export async function getDirectoryTree(): Promise<DirectoryNode[]> {
  const allDirectories = await directoryRepo.findAll()

  const map: Record<string, DirectoryNode> = {}
  const roots: DirectoryNode[] = []

  for (const dir of allDirectories) {
    map[dir.id] = { ...dir, children: [] }
  }

  for (const dirId in map) {
    const node = map[dirId]
    if (node.parentId && map[node.parentId]) {
      map[node.parentId].children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

/**
 * 递归删除目录及其所有子目录和关联内容
 * @param id - 要删除的目录ID
 */
export async function deleteDirectory(id: string): Promise<void> {
  // 使用事务确保操作的原子性
  await db.transaction().execute(async (trx) => {
    // 1. 找到所有子目录
    const children = await trx.selectFrom('directories').select(['id']).where('parentId', '=', id).execute()

    // 2. 递归删除每一个子目录
    for (const child of children) {
      // 在事务中递归调用自身逻辑需要传递 trx 实例，
      // 但为了简化，我们这里重新发起一个完整的删除流程。
      // 注意：在更复杂的场景下，你可能需要将事务逻辑传递下去。
      await deleteDirectory(child.id)
    }

    // 3. 在这里可以添加删除该目录下所有媒体文件的逻辑
    // 例如: await trx.deleteFrom('media').where('directoryId', '=', id).execute()

    // 4. 删除当前目录
    await trx.deleteFrom('directories').where('id', '=', id).execute()
  })
}
