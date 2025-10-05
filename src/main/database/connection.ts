// src/main/database/connection.ts

import Database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import { Database as DB } from './schema' // 导入我们定义的 Schema
import path from 'path'
import { app } from 'electron'

// 数据库文件的存放路径，app.getPath('userData') 是 Electron 推荐的存放用户数据的目录
const dbPath = path.join(app.getPath('userData'), 'haunshi_el.db')

// 创建 better-sqlite3 数据库实例
const sqlite = new Database(dbPath)

// 定义 Kysely 的方言 (Dialect)
const dialect = new SqliteDialect({
  database: sqlite
})

// 创建并导出 Kysely 实例，整个应用将通过它来操作数据库
// <DB> 泛型参数确保了所有操作都是类型安全的
export const db = new Kysely<DB>({
  dialect,
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
  // 你的建表语句
  const createMediaTableSQL = `
  CREATE TABLE IF NOT EXISTS media
  (
    id           TEXT PRIMARY KEY NOT NULL,
    hashId       TEXT UNIQUE,
    name         TEXT             NOT NULL,
    ext          TEXT             NOT NULL,
    width        INTEGER          NOT NULL,
    height       INTEGER          NOT NULL,
    size         INTEGER          NOT NULL,
    score        INTEGER DEFAULT 0,
    time         INTEGER          NOT NULL,
    revisionTime INTEGER          NOT NULL,
    note         TEXT,
    url          TEXT,
    thumbnailUrl TEXT,
    palettes     TEXT,
    author       TEXT,
    comments     TEXT,
    isDeleted    INTEGER DEFAULT 0
  );
`
  // 直接使用 better-sqlite3 实例来执行初始化的 SQL
  sqlite.exec(createMediaTableSQL)
  console.log('数据库初始化成功.')
}
