import { Module, ValidationPipe, PipeTransform } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@libs/shared';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoomModule } from './room/room.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { EventsModule } from './events/events.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '..', '..', '.env'), // 项目根目录 .env
        '.env', // 当前目录 .env
      ],
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    RoomModule,
    ChatModule,
    FileModule,
    EventsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: (): PipeTransform =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
  ],
})
export class AppModule {}
