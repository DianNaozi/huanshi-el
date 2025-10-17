// src/main/database/repositories/directoryRepository.ts

import { db } from '../connection'
import { Insertable, Updateable } from 'kysely'
import { DirectoriesTable } from '../schema' // 确保 schema.ts 导出了这个类型
import { randomUUID } from 'crypto'

// 为上层服务定义清晰的类型
export type DirectoryEntity = DirectoriesTable
export type DirectoryCreatePayload = Omit<Insertable<DirectoriesTable>, 'id' | 'createdAt'> & {
  parentId?: string | null
}
export type DirectoryUpdatePayload = Updateable<DirectoriesTable>

/**
 * 查找所有目录
 * @returns 所有目录的扁平数组
 */
export async function findAll(): Promise<DirectoryEntity[]> {
  return await db.selectFrom('directories').selectAll().execute()
}

/**
 * 根据父ID查找子目录
 * @param parentId - 父目录ID
 * @returns 子目录数组
 */
export async function findByParentId(parentId: string): Promise<DirectoryEntity[]> {
  return await db.selectFrom('directories').selectAll().where('parentId', '=', parentId).execute()
}

/**
 * 创建一个新目录
 * @param payload - 包含 name 和 parentId 的对象
 * @returns 创建成功的目录实体
 */
export async function create(payload: DirectoryCreatePayload): Promise<DirectoryEntity> {
  const newDirectory: Insertable<DirectoriesTable> = {
    id: randomUUID(),
    name: payload.name,
    parentId: payload.parentId ?? null,
    createdAt: Date.now()
  }
  return await db
    .insertInto('directories')
    .values(newDirectory)
    .returningAll()
    .executeTakeFirstOrThrow()
}

/**
 * 更新目录信息 (这里只演示更新名称)
 * @param id - 目录ID
 * @param payload - 包含要更新字段的对象
 * @returns 更新后的目录实体, 如果未找到则返回 undefined
 */
export async function update(
  id: string,
  payload: DirectoryUpdatePayload
): Promise<DirectoryEntity | undefined> {
  return await db
    .updateTable('directories')
    .set(payload)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

/**
 * 根据ID删除一个目录 (注意：只删除单个, 不处理子级)
 * @param id - 目录ID
 * @returns 删除结果
 */
export async function remove(id: string) {
  return await db.deleteFrom('directories').where('id', '=', id).executeTakeFirst()
}
