import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@libs/shared';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(data: {
    content: string;
    type: string;
    senderId: number;
    receiverId?: number;
    roomId?: number;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    // 验证: 恰好一个目标
    if (!data.receiverId && !data.roomId) {
      throw new BadRequestException('必须指定 receiverId 或 roomId');
    }
    if (data.receiverId && data.roomId) {
      throw new BadRequestException('不能同时指定 receiverId 和 roomId');
    }

    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        type: data.type,
        senderId: data.senderId,
        receiverId: data.receiverId,
        roomId: data.roomId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    return message;
  }

  async getPrivateHistory(userId1: number, userId2: number, page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
        },
        include: {
          sender: {
            select: { id: true, username: true, displayName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.message.count({
        where: {
          OR: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
        },
      }),
    ]);
    return { messages: messages.reverse(), total, page, pageSize };
  }

  async getRoomHistory(roomId: number, page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { roomId },
        include: {
          sender: {
            select: { id: true, username: true, displayName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.message.count({ where: { roomId } }),
    ]);
    return { messages: messages.reverse(), total, page, pageSize };
  }
}
