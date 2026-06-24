import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        status: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: { displayName: 'asc' },
    });
  }

  async findOnline() {
    return this.prisma.user.findMany({
      where: { status: 'online' },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        status: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: { displayName: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        status: true,
        lastSeenAt: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
