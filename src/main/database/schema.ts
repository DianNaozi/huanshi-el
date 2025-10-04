// 对应你的 media 表结构
export interface MediaTable {
  id: string
  hashId: string | null // UNIQUE 列可以是 null
  name: string
  ext: string
  width: number
  height: number
  size: number
  score: number // DEFAULT 0，在插入时 Kysely 会处理
  time: number
  revisionTime: number
  note: string | null
  url: string | null
  thumbnailUrl: string | null
  palettes: string | null // 建议存储为 JSON 字符串
  author: string | null
  comments: string | null
  isDeleted: number // DEFAULT 0, 在 SQLite 中通常用 0 代表 false, 1 代表 true
}

// 这是整个数据库的 Schema 定义
// 未来如果有更多的表，都在这里添加
export interface Database {
  media: MediaTable
}
