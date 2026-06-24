import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.room.findMany({
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatar: true, status: true },
            },
          },
        },
        _count: { select: { members: true, messages: true } },
      },
    });
    if (!room) throw new NotFoundException('房间不存在');
    return room;
  }

  async create(dto: CreateRoomDto, creatorId: number) {
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        isGroup: dto.isGroup ?? false,
        members: {
          create: { userId: creatorId },
        },
      },
    });
    return room;
  }

  async findRoomMessages(roomId: number, page = 1, pageSize = 50) {
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

  async getMembers(roomId: number) {
    return this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true, status: true },
        },
      },
    });
  }

  async addMember(roomId: number, userId: number) {
    return this.prisma.roomMember.create({
      data: { roomId, userId },
    });
  }
}
