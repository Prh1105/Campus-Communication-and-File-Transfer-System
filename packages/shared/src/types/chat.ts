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
  receiverId: number
  roomId?: number
  content: string
  type: MessageType
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
}

export interface SendMessageDto {
  receiverId: number
  content: string
  type: MessageType
  fileUrl?: string
}

// ========== 房间/群组 ==========
export interface Room {
  id: number
  name: string
  avatar?: string
  isGroup: boolean
  memberIds: number[]
  lastMessage?: Message
  createdAt: string
}

// ========== WebSocket 事件 ==========
export enum WsEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  SEND_MESSAGE = 'sendMessage',
  RECEIVE_MESSAGE = 'receiveMessage',
  USER_ONLINE = 'userOnline',
  USER_OFFLINE = 'userOffline',
  TYPING = 'typing',
  STOP_TYPING = 'stopTyping',
}