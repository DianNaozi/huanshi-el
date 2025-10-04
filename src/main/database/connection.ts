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
  dialect
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
  console.log('Database initialized successfully.')
}
