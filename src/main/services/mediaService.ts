import { MediaTable } from '../database/schema'

import { mediaRepository } from '../database/repositories/mediaRepository'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import mime from 'mime-types'
import { db } from '../database/connection'
import { generateMediaId } from '../utils/stringUtils'

// 示例：获取所有媒体文件
export async function getAllMedia(): Promise<MediaTable[]> {
  return await mediaRepository.findAll()
}

// 媒体文件库的基础路径
const MEDIA_LIBRARY_PATH = 'G:\\h.huanshi'
const THUMBNAIL_WIDTH = 500 // 缩略图宽度
/**
 * 处理单个媒体文件：提取信息、生成缩略图并存入数据库
 * @param filePath 文件路径
 * @returns 返回处理后的媒体对象，如果文件已存在或不受支持则返回 null
 */
export async function processMediaFile(filePath: string): Promise<MediaTable | null> {
  try {
    // 确保媒体库根目录存在
    await fs.mkdir(MEDIA_LIBRARY_PATH, { recursive: true })

    // 1. 检查文件类型是否为支持的图片
    const mimeType = mime.lookup(filePath)
    if (!mimeType || !mimeType.startsWith('image/')) {
      console.log(`不支持的图片类型: ${filePath}`)
      return null
    }

    // 2. 计算文件哈希，用于判断是否重复
    const fileBuffer = await fs.readFile(filePath)
    const hashId = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    const existingMedia = await db
      .selectFrom('media')
      .selectAll() // <-- 明确指定查询所有列
      .where('hashId', '=', hashId)
      .executeTakeFirst()

    if (existingMedia) {
      console.log(`文件已经存在: ${filePath}`, existingMedia)
      // 如果文件已存在，也可以选择返回已存在的数据
      return null
    }

    // 3. 生成新的媒体ID并创建对应的文件夹
    const newId = generateMediaId()
    const itemDirectoryPath = path.join(MEDIA_LIBRARY_PATH, newId)
    await fs.mkdir(itemDirectoryPath, { recursive: true })

    // 4. 定义新文件的路径
    const originalFileName = path.basename(filePath)
    const newOriginalFilePath = path.join(itemDirectoryPath, originalFileName)
    const newThumbnailPath = path.join(itemDirectoryPath, 'thumbnail.jpg')

    // 5. 复制原始文件到新目录
    await fs.copyFile(filePath, newOriginalFilePath)

    // 6. 使用 sharp 获取图片元数据并生成和保存缩略图
    const image = sharp(fileBuffer)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      console.error(`Could not read metadata for: ${filePath}`)
      // 清理已创建的文件夹
      await fs.rm(itemDirectoryPath, { recursive: true, force: true })
      return null
    }

    const thumbnailBuffer = await image.resize(THUMBNAIL_WIDTH).jpeg({ quality: 80 }).toBuffer()
    // 将缩略图Buffer写入文件
    await fs.writeFile(newThumbnailPath, thumbnailBuffer)

    // 7. 准备存入数据库的数据，URL全部使用新路径
    const mediaData = {
      id: newId,
      hashId: hashId,
      name: originalFileName,
      originalFileName: originalFileName,
      ext: path.extname(filePath),
      width: metadata.width,
      height: metadata.height,
      size: metadata.size || fileBuffer.length,
      time: Date.now(),
      url: `${newOriginalFilePath}`, // 存储复制后原件的本地URL
      thumbnailUrl: `${newThumbnailPath}`, // 存储缩略图文件的本地URL
      isDeleted: 0,
      score: 0,
      note: null,
      palettes: null,
      author: null,
      comments: null
    }

    // 8. 存入数据库
    const savedMedia = await mediaRepository.create(mediaData)

    // 确保返回给前端的对象包含正确的缩略图 URL
    return savedMedia
  } catch (error) {
    console.error(`Failed to process file ${filePath}:`, error)
    return null
  }
}
