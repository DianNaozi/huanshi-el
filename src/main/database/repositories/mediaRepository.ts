// src/main/database/repositories/mediaRepository.ts

import { Insertable, Updateable } from 'kysely'
import { db } from '../connection'
import { MediaTable } from '../schema'

// 使用 Kysely 的工具类型，方便地创建用于插入和更新的类型
// Insertable 会排除掉那些由数据库自动生成的列
type MediaInsert = Insertable<MediaTable>
type MediaUpdate = Updateable<MediaTable>

/**
 * 创建一条新的媒体记录
 * @param media - 要插入的媒体数据
 * @returns 返回插入的数据
 */
async function create(media: MediaInsert) {
  return await db.insertInto('media').values(media).returningAll().executeTakeFirstOrThrow()
}

/**
 * 根据 ID 更新媒体记录
 * @param id - 媒体记录的 ID
 * @param mediaUpdate - 需要更新的字段
 * @returns 返回更新后的数据
 */
async function update(id: string, mediaUpdate: MediaUpdate) {
  return await db
    .updateTable('media')
    .set(mediaUpdate)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

/**
 * 根据 ID 查找媒体记录 (不包括已软删除的)
 * @param id - 媒体记录的 ID
 * @returns 返回找到的媒体记录，或 undefined
 */
async function findById(id: string) {
  return await db
    .selectFrom('media')
    .selectAll()
    .where('id', '=', id)
    .where('isDeleted', '=', 0) // 业务查询通常排除软删除的记录
    .executeTakeFirst()
}

/**
 * 查询所有媒体记录 (不包括已软删除的)
 * @returns 返回所有媒体记录的数组
 */
async function findAll() {
  return await db.selectFrom('media').selectAll().where('isDeleted', '=', 0).execute()
}

/**
 * 软删除一条媒体记录
 * 通过将 isDeleted 字段设置为 1 来实现，而不是真正从数据库中删除
 * @param id - 要软删除的媒体记录的 ID
 * @returns 返回操作结果
 */
async function softDelete(id: string) {
  return await db
    .updateTable('media')
    .set({ isDeleted: 1, revisionTime: Date.now() }) // 同时更新修改时间
    .where('id', '=', id)
    .executeTakeFirst()
}

/**
 * 物理删除一条记录 (如果需要的话)
 * @param id - 要物理删除的媒体记录的 ID
 * @returns 返回操作结果
 */
async function hardDelete(id: string) {
  return await db.deleteFrom('media').where('id', '=', id).executeTakeFirst()
}

// 将所有方法聚合到一个对象中并导出
export const mediaRepository = {
  create,
  update,
  findById,
  findAll,
  softDelete,
  hardDelete
}
