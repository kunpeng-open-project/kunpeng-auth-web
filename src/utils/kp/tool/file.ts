import { FileData } from "@/utils/kp/data/systemData"

/**
 * 获取文件图标
 */
export const getFileIcon = (file: any) => {
  // const extension = file.name?.split(".").pop()?.toLowerCase() || ""
  const extension = (file.name || file.fileName)?.split(".").pop()?.toLowerCase() || "";
  const type = file.fileType || file.type || ""

  // 图片文件
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
    return "ri:image-line"
  }
  // PDF文件
  if (type === "application/pdf" || extension === "pdf") {
    return "ri:file-pdf-line"
  }
  // Word文档
  if (type.includes("word") || ["doc", "docx"].includes(extension)) {
    return "ri:file-word-line"
  }
  // Excel文档
  if (type.includes("excel") || ["xls", "xlsx"].includes(extension)) {
    return "ri:file-excel-line"
  }
  // PPT文档
  if (type.includes("powerpoint") || ["ppt", "pptx"].includes(extension)) {
    return "ri:file-ppt-line"
  }
  // 压缩文件
  if (type.includes("zip") || ["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "ri:file-zip-line"
  }
  // 文本文件
  if (type.startsWith("text/") || ["txt", "md", "json", "xml", "csv"].includes(extension)) {
    return "ri:file-text-line"
  }
  // 视频文件
  if (type.startsWith("video/") || ["mp4", "avi", "mov", "wmv", "flv"].includes(extension)) {
    return "ri:file-video-line"
  }
  // 音频文件
  if (type.startsWith("audio/") || ["mp3", "wav", "aac", "flac"].includes(extension)) {
    return "ri:file-music-line"
  }
  // 默认文件图标
  return "ri:file-line"
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (file: any): string => {
  if (file.fileSize === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(file.fileSize) / Math.log(k))
  return parseFloat((file.fileSize / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}



/**
 * 判断是否为图片文件
 */
export const isImage = (file: FileData | null): boolean => {
  if (!file) return false
  const type = file.fileType || ""
  const extension = file.name?.split(".").pop()?.toLowerCase() || ""
  return type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)
}