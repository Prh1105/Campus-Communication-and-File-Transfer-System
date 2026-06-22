export interface FileInfo {
  id: number
  originalName: string
  fileName: string
  mimeType: string
  size: number
  url: string
  uploadedById: number
  createdAt: string
}

export interface UploadProgress {
  fileName: string
  progress: number // 0-100
  status: 'uploading' | 'completed' | 'failed'
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/vnd.rar',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]