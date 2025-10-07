// src/main/database/schema.ts

/**
 * 对应 media 表的 TypeScript 接口
 * 该接口根据 connection.ts 中的 SQL 语句生成
 */
export interface MediaTable {
  id: string
  hashId: string | null
  directoryId: string | null
  name: string
  originalFileName: string | null
  ext: string
  mimeType: string | null
  width: number
  height: number
  size: number
  score: number
  time: number
  note: string | null
  url: string | null
  thumbnailUrl: string | null
  palettes: string | null
  author: string | null
  comments: string | null
  isDeleted: number
  usageCount: number
  perceptualHash: string | null
  durationSeconds: number
}

/**
 * 对应 directories 表的 TypeScript 接口
 */
export interface DirectoriesTable {
  id: string
  parentId: string | null // parentId 为 NULL 表示根目录
  name: string
  createdAt: number // 存储 Unix 时间戳
}

/**
 * 对应 tags 表的 TypeScript 接口
 */
export interface TagsTable {
  id: string
  name: string // 标签名唯一
  color: string | null
}

/**
 * 对应 mediaTags 关联表的 TypeScript 接口
 * 用于表示媒体和标签的多对多关系
 */
export interface MediaTagsTable {
  mediaId: string
  tagId: string
}

/**
 * 对应 playbackHistory 表的 TypeScript 接口
 */
export interface PlaybackHistoryTable {
  id: string
  mediaId: string
  playedAt: number // 播放时间点的 Unix 时间戳
  durationPlayedSeconds: number // 本次播放时长(秒)
}

/**
 * 对应 settings 表的 TypeScript 接口
 * 用于存储键值对
 */
export interface SettingsTable {
  key: string
  value: string | null
}

/**
 * 整个数据库的 Schema 定义
 * 所有表都应在此处注册，Kysely 将基于此提供类型安全
 */
export interface Database {
  media: MediaTable
  directories: DirectoriesTable
  tags: TagsTable
  mediaTags: MediaTagsTable
  playbackHistory: PlaybackHistoryTable
  settings: SettingsTable
}
