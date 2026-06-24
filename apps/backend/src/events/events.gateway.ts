import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat/chat.service';
import { PrismaService } from '@libs/shared';
import type { AuthenticatedSocket } from './ws-auth.middleware';
import { createWsAuthMiddleware } from './ws-auth.middleware';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  // 在线用户: Map<userId, Set<socketId>>
  private onlineUsers = new Map<number, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    // 注册 JWT 认证中间件
    const middleware = createWsAuthMiddleware(this.jwtService);
    this.server.use(middleware as any);
    this.logger.log('WebSocket Gateway 初始化完成');
  }

  async handleConnection(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user) {
      client.disconnect();
      return;
    }

    // 加入在线列表
    if (!this.onlineUsers.has(user.id)) {
      this.onlineUsers.set(user.id, new Set());
      // 首次上线: 更新数据库状态
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'online', lastSeenAt: new Date() },
      });
      // 广播上线通知
      this.server.emit('userOnline', {
        userId: user.id,
        username: user.username,
      });
    }
    this.onlineUsers.get(user.id)!.add(client.id);

    this.logger.log(`用户 ${user.username} (${user.id}) 已连接. 在线: ${this.onlineUsers.size}`);
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user) return;

    // 从在线列表中移除
    const sockets = this.onlineUsers.get(user.id);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(user.id);
        // 更新数据库: 离线
        await this.prisma.user.update({
          where: { id: user.id },
          data: { status: 'offline', lastSeenAt: new Date() },
        });
        // 广播下线通知
        this.server.emit('userOffline', {
          userId: user.id,
          username: user.username,
        });
        this.logger.log(`用户 ${user.username} (${user.id}) 已离线`);
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: AuthenticatedSocket, payload: any) {
    try {
      const senderId = client.data.user.id;

      // 如果发送到房间，自动加入该房间
      if (payload.roomId) {
        client.join(`room:${payload.roomId}`);
      }

      const message = await this.chatService.createMessage({
        content: payload.content,
        type: payload.type || 'text',
        senderId,
        receiverId: payload.receiverId,
        roomId: payload.roomId,
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
      });

      if (payload.receiverId) {
        // 私聊: 发送给接收者的所有 socket + 回给发送者
        const receiverSockets = this.onlineUsers.get(payload.receiverId);
        if (receiverSockets) {
          for (const sid of receiverSockets) {
            this.server.to(sid).emit('receiveMessage', message);
          }
        }
        // 发回给发送者
        this.server.to(client.id).emit('receiveMessage', message);
      } else if (payload.roomId) {
        // 群聊: 广播到房间
        this.server.to(`room:${payload.roomId}`).emit('receiveMessage', message);
        // 更新房间的 updatedAt
        await this.prisma.room.update({
          where: { id: payload.roomId },
          data: { updatedAt: new Date() },
        });
      }
    } catch (error) {
      client.emit('error', { message: (error as Error).message });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: AuthenticatedSocket, roomId: number) {
    client.join(`room:${roomId}`);
    this.logger.log(`用户 ${client.data.user.username} 加入房间 ${roomId}`);
    this.server.to(`room:${roomId}`).emit('userJoinedRoom', {
      userId: client.data.user.id,
      username: client.data.user.username,
      roomId,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: AuthenticatedSocket, roomId: number) {
    client.leave(`room:${roomId}`);
    this.server.to(`room:${roomId}`).emit('userLeftRoom', {
      userId: client.data.user.id,
      username: client.data.user.username,
      roomId,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(client: AuthenticatedSocket, payload: { receiverId?: number; roomId?: number }) {
    if (payload.receiverId) {
      const sockets = this.onlineUsers.get(payload.receiverId);
      if (sockets) {
        for (const sid of sockets) {
          this.server.to(sid).emit('typing', {
            userId: client.data.user.id,
            username: client.data.user.username,
          });
        }
      }
    } else if (payload.roomId) {
      client.to(`room:${payload.roomId}`).emit('typing', {
        userId: client.data.user.id,
        username: client.data.user.username,
      });
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(client: AuthenticatedSocket, payload: { receiverId?: number; roomId?: number }) {
    if (payload.receiverId) {
      const sockets = this.onlineUsers.get(payload.receiverId);
      if (sockets) {
        for (const sid of sockets) {
          this.server.to(sid).emit('stopTyping', {
            userId: client.data.user.id,
          });
        }
      }
    } else if (payload.roomId) {
      client.to(`room:${payload.roomId}`).emit('stopTyping', {
        userId: client.data.user.id,
      });
    }
  }

  // 获取在线用户 ID 列表
  getOnlineUserIds(): number[] {
    return Array.from(this.onlineUsers.keys());
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
}
