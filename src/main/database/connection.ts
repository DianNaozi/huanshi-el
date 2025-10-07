// src/main/database/connection.ts

import Database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import { Database as DB } from './schema' // 导入我们定义的 Schema
import path from 'path'
import { app } from 'electron'

// 数据库文件的存放路径，app.getPath('userData') 是 Electron 推荐的存放用户数据的目录
const dbPath = path.join(app.getPath('userData'), 'huanshi-el.db')

// 创建 better-sqlite3 数据库实例
const sqlite = new Database(dbPath)

// 定义 Kysely 的方言 (Dialect)
const dialect = new SqliteDialect({
  database: sqlite
})

// 创建并导出 Kysely 实例，整个应用将通过它来操作数据库
// <DB> 泛型参数确保了所有操作都是类型安全的
export const db = new Kysely<DB>({
  dialect
  // log(event) {
  //   // 只在非生产环境下打印日志
  //   // electron-vite 会自动为你设置好 process.env.NODE_ENV
  //   if (process.env.NODE_ENV !== 'production') {
  //     // event.level 可以是 'query' 或 'error'
  //     if (event.level === 'query') {
  //       console.log('--- Kysely Query ---')
  //       // event.query.sql 是带有占位符 (?) 的 SQL 语句
  //       console.log('SQL:', event.query.sql)
  //       // event.query.parameters 是实际绑定的参数数组
  //       console.log('Params:', event.query.parameters)
  //       // event.queryDurationMillis 是查询耗时（毫秒）
  //       console.log('Duration:', `${event.queryDurationMillis.toFixed(2)} ms`)
  //       console.log('--------------------')
  //     }
  //     if (event.level === 'error') {
  //       console.error('--- Kysely Error ---')
  //       console.error(event.error)
  //       console.error('--------------------')
  //     }
  //   }
  // }
})

// 数据库初始化函数
export function initializeDatabase(): void {
  // 使用事务来执行所有的建表语句
  const initTransaction = sqlite.transaction(() => {
    // 1. 媒体文件表 (来自你的文件)
    const createMediaTableSQL = `
    CREATE TABLE IF NOT EXISTS media
    (
      id           TEXT PRIMARY KEY NOT NULL,
      hashId       TEXT UNIQUE,
      directoryId  TEXT,
      name         TEXT NOT NULL,
      originalFileName TEXT,
      ext          TEXT NOT NULL,
      mimeType     TEXT,
      width        INTEGER NOT NULL,
      height       INTEGER NOT NULL,
      size         INTEGER NOT NULL,
      score        INTEGER DEFAULT 0,
      time         INTEGER NOT NULL,
      note         TEXT,
      url          TEXT,
      thumbnailUrl TEXT,
      palettes     TEXT,
      author       TEXT,
      comments     TEXT,
      isDeleted    INTEGER DEFAULT 0,
      usageCount        INTEGER DEFAULT 0,
      perceptualHash    TEXT,
      durationSeconds   REAL DEFAULT 0
    );
    `
    sqlite.exec(createMediaTableSQL)

    // 2. 目录结构表
    const createDirectoriesTableSQL = `
    CREATE TABLE IF NOT EXISTS directories
    (
      id        TEXT PRIMARY KEY NOT NULL,
      parentId  TEXT, -- 指向父目录的id, NULL表示根目录
      name      TEXT NOT NULL,
      createdAt INTEGER NOT NULL -- 使用Unix时间戳
    );
    `
    sqlite.exec(createDirectoriesTableSQL)

    // 3. 标签表
    const createTagsTableSQL = `
    CREATE TABLE IF NOT EXISTS tags
    (
      id    TEXT PRIMARY KEY NOT NULL,
      name  TEXT NOT NULL UNIQUE, -- 标签名唯一
      color TEXT -- 用于UI显示的颜色
    );
    `
    sqlite.exec(createTagsTableSQL)

    // 4. 媒体与标签的关联表 (多对多关系)
    const createMediaTagsTableSQL = `
    CREATE TABLE IF NOT EXISTS mediaTags
    (
      mediaId TEXT NOT NULL,
      tagId   TEXT NOT NULL,
      PRIMARY KEY (mediaId, tagId) -- 复合主键, 防止重复关联
    );
    `
    sqlite.exec(createMediaTagsTableSQL)

    // 5. 播放历史记录表
    const createPlaybackHistoryTableSQL = `
    CREATE TABLE IF NOT EXISTS playbackHistory
    (
      id                    TEXT PRIMARY KEY NOT NULL,
      mediaId               TEXT NOT NULL,
      playedAt              INTEGER NOT NULL, -- 播放时间点的Unix时间戳
      durationPlayedSeconds REAL    NOT NULL  -- 本次播放时长(秒)
    );
    `
    sqlite.exec(createPlaybackHistoryTableSQL)

    // 6. 应用设置表 (键值对)
    const createSettingsTableSQL = `
    CREATE TABLE IF NOT EXISTS settings
    (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
    `
    sqlite.exec(createSettingsTableSQL)
  })

  try {
    initTransaction()
    console.log('数据库和所有表初始化成功。')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }
}
