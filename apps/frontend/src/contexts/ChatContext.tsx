import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Message, User, Room, MessageType } from '@campus-im/shared';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

type ChatTarget = { type: 'private'; userId: number } | { type: 'room'; roomId: number } | null;

interface ChatState {
  messages: Message[];
  onlineUsers: User[];
  rooms: Room[];
  activeChat: ChatTarget;
  typingUsers: number[];
  sendMessage: (content: string, type?: MessageType, file?: { url: string; name: string; size: number }) => void;
  loadHistory: (target: ChatTarget) => Promise<void>;
  selectChat: (target: ChatTarget) => void;
  setOnlineUsers: (users: User[]) => void;
  setRooms: (rooms: Room[]) => void;
}

const ChatContext = createContext<ChatState | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeChat, setActiveChat] = useState<ChatTarget>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  const selectChat = useCallback((target: ChatTarget) => {
    setActiveChat(target);
    setMessages([]);
  }, []);

  const loadHistory = useCallback(
    async (target: ChatTarget) => {
      if (!target) return;
      try {
        if (target.type === 'private') {
          const { getPrivateHistory } = await import('../services/chat.service');
          const result = await getPrivateHistory(target.userId);
          setMessages(result.data);
        } else {
          const { getRoomHistory } = await import('../services/chat.service');
          const result = await getRoomHistory(target.roomId);
          setMessages(result.data);
        }
      } catch (err) {
        console.error('加载聊天记录失败:', err);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    (content: string, type: MessageType = 'text', file?: { url: string; name: string; size: number }) => {
      if (!socket || !activeChat || !user) return;

      const payload: any = {
        content,
        type,
        fileUrl: file?.url,
        fileName: file?.name,
        fileSize: file?.size,
      };

      if (activeChat.type === 'private') {
        payload.receiverId = activeChat.userId;
      } else {
        payload.roomId = activeChat.roomId;
      }

      socket.emit('sendMessage', payload);
    },
    [socket, activeChat, user],
  );

  // 监听 Socket 事件
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleUserOnline = (data: { userId: number; username: string }) => {
      setOnlineUsers((prev) =>
        prev.map((u) => (u.id === data.userId ? { ...u, status: 'online' as const } : u)),
      );
    };

    const handleUserOffline = (data: { userId: number; username: string }) => {
      setOnlineUsers((prev) =>
        prev.map((u) => (u.id === data.userId ? { ...u, status: 'offline' as const } : u)),
      );
    };

    const handleTyping = (data: { userId: number }) => {
      setTypingUsers((prev) => (prev.includes(data.userId) ? prev : [...prev, data.userId]));
    };

    const handleStopTyping = (data: { userId: number }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        onlineUsers,
        rooms,
        activeChat,
        typingUsers,
        sendMessage,
        loadHistory,
        selectChat,
        setOnlineUsers,
        setRooms,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatState {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
