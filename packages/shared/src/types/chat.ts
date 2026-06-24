// ========== 用户 ==========
export interface User {
  id: number
  username: string
  displayName: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeenAt?: string
}

export interface AuthUser extends User {
  email: string
  createdAt: string
}

// ========== 消息 ==========
export type MessageType = 'text' | 'image' | 'file' | 'system'

export interface Message {
  id: number
  senderId: number
  receiverId?: number
  roomId?: number
  content: string
  type: MessageType
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  sender?: User
}

export interface SendMessageDto {
  receiverId?: number
  roomId?: number
  content: string
  type: MessageType
  fileUrl?: string
  fileName?: string
  fileSize?: number
}

// ========== 房间/群组 ==========
export interface Room {
  id: number
  name: string
  avatar?: string
  isGroup: boolean
  memberIds: number[]
  memberCount?: number
  lastMessage?: Message
  createdAt: string
}

// ========== WebSocket 事件 ==========
export const WsEvent = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
} as const;

export type WsEvent = (typeof WsEvent)[keyof typeof WsEvent];

// ========== WebSocket 事件负载类型 ==========
export interface WsMessagePayload {
  content: string
  type: MessageType
  receiverId?: number
  roomId?: number
  fileUrl?: string
  fileName?: string
  fileSize?: number
}

export interface WsTypingPayload {
  receiverId?: number
  roomId?: number
}

export interface WsOnlineUserPayload {
  userId: number
  username: string
  displayName: string
  avatar?: string
}
