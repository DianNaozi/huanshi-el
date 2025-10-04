// src/main/services/mediaService.ts
import { mediaRepository } from '../database/repositories/mediaRepository'

// 示例：添加一个新的媒体文件
export async function addNewMedia(mediaData) {
  // 在这里可以添加业务逻辑，比如数据校验、生成 ID 等
  const newMedia = {
    id: crypto.randomUUID(), // 使用内置 crypto 生成唯一 ID
    ...mediaData,
    time: Date.now(),
    revisionTime: Date.now()
  }
  return await mediaRepository.create(newMedia)
}

// 示例：获取所有媒体文件
export async function getAllMedia() {
  return await mediaRepository.findAll()
}

// 示例：更新评分
export async function updateMediaScore(id: string, score: number) {
  return await mediaRepository.update(id, { score, revisionTime: Date.now() })
}
