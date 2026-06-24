import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      this.logger.log(`数据库已有 ${userCount} 个用户，跳过种子数据`);
      return;
    }

    this.logger.log('开始创建种子数据...');
    const hashedPassword = await bcrypt.hash('pass1', 10);

    // 创建 5 个测试用户
    const users: Array<{ id: number; username: string; displayName: string }> = [];
    for (let i = 1; i <= 5; i++) {
      const user = await this.prisma.user.create({
        data: {
          username: `user${i}`,
          email: `user${i}@campus.im`,
          displayName: `测试用户${i}`,
          password: hashedPassword,
          status: 'offline',
        },
      });
      users.push(user);
    }

    // 创建公共聊天室
    const room = await this.prisma.room.create({
      data: {
        name: '校园广场',
        isGroup: true,
        members: {
          create: users.map((u) => ({ userId: u.id })),
        },
      },
    });

    // 发送欢迎消息
    await this.prisma.message.create({
      data: {
        content: '欢迎来到校园广场！这是一个公共聊天室，请文明交流。',
        type: 'system',
        senderId: users[0].id,
        roomId: room.id,
      },
    });

    this.logger.log(
      `种子数据创建完成: ${users.length} 个用户, 1 个公共聊天室 "校园广场"`,
    );
    this.logger.log('测试账号: user1 ~ user5, 密码统一: pass1');
  }
}
