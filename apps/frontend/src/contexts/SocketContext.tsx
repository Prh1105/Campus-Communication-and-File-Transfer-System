import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';

interface SocketState {
  socket: Socket | null;
}

const SocketContext = createContext<SocketState>({ socket: null });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = connectSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[WS] 已连接:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('[WS] 断开:', reason);
      });

      socket.on('connect_error', (err) => {
        console.error('[WS] 连接错误:', err.message);
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketState {
  return useContext(SocketContext);
}
