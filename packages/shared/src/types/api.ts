export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
  displayName: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}