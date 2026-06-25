import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Message, User, Room, MessageType } from "@campus-im/shared";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import {
  getPrivateHistory,
  getRoomHistory,
} from "../services/chat.service";

type ChatTarget =
  | { type: "private"; userId: number }
  | { type: "room"; roomId: number }
  | null;

interface ChatState {
  messages: Message[];
  onlineUsers: User[];
  rooms: Room[];
  activeChat: ChatTarget;
  typingUsers: number[];
  sendMessage: (
    content: string,
    type?: MessageType,
    file?: { url: string; name: string; size: number },
  ) => void;
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
  const activeChatRef = useRef<ChatTarget>(null);

  const selectChat = useCallback((target: ChatTarget) => {
    activeChatRef.current = target;
    setActiveChat(target);
    setMessages([]);
  }, []);

  const loadHistory = useCallback(async (target: ChatTarget) => {
    if (!target) return;
    try {
      let messages: Message[];
      if (target.type === "private") {
        const result = await getPrivateHistory(target.userId);
        // 拦截器已解包 {code,data} → data 是 {data: Message[], pagination}
        messages = Array.isArray(result) ? result : (result?.data || []);
      } else {
        const result = await getRoomHistory(target.roomId);
        messages = Array.isArray(result) ? result : (result?.data || []);
      }
      setMessages(messages);
    } catch (err: any) {
      console.error("加载聊天记录失败:", err.message);
    }
  }, []);

  const sendMessage = useCallback(
    (
      content: string,
      type: MessageType = "text",
      file?: { url: string; name: string; size: number },
    ) => {
      if (!socket || !activeChat || !user) return;

      const payload: any = {
        content,
        type,
        fileUrl: file?.url,
        fileName: file?.name,
        fileSize: file?.size,
      };

      if (activeChat.type === "private") {
        payload.receiverId = activeChat.userId;
      } else {
        payload.roomId = activeChat.roomId;
      }

      socket.emit("sendMessage", payload);
    },
    [socket, activeChat, user],
  );

  // 监听 Socket 事件
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      const chat = activeChatRef.current;
      // 只接收当前活跃聊天的消息，过滤掉其他聊天的消息
      if (!chat || !user) return;
      const isRelevant =
        (chat.type === "private" &&
          ((msg.senderId === user.id && msg.receiverId === chat.userId) ||
            (msg.senderId === chat.userId && msg.receiverId === user.id))) ||
        (chat.type === "room" && msg.roomId === chat.roomId);
      if (!isRelevant) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleUserOnline = (data: { userId: number; username: string }) => {
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId ? { ...u, status: "online" as const } : u,
        ),
      );
    };

    const handleUserOffline = (data: { userId: number; username: string }) => {
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId ? { ...u, status: "offline" as const } : u,
        ),
      );
    };

    const handleTyping = (data: { userId: number }) => {
      setTypingUsers((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId],
      );
    };

    const handleStopTyping = (data: { userId: number }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, user]);

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
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
