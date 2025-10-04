import { randomBytes } from 'crypto'

/**
 * 生成符合 "FM" + 16位大写十六进制字符格式的媒体ID。
 * 这种格式模仿了某些现有系统（如FileMaker）的行为，并提供了64位的随机性 (2^64 种可能性)。
 *
 * @returns {string} 一个新的、唯一的媒体ID，例如："FMDC351FEBF843185D"。
 */
export function generateMediaId(): string {
  const randomHex = randomBytes(8).toString('hex').toUpperCase()
  return `FM${randomHex}`
}
