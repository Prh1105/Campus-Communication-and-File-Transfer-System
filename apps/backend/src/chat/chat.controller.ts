import { Controller, Get, Param, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseService } from '@libs/shared';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('private/:userId')
  async getPrivateHistory(
    @Req() req: any,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 50,
  ) {
    const result = await this.chatService.getPrivateHistory(req.user.id, userId, page, pageSize);
    return this.responseService.paginated(
      result.messages,
      result.total,
      result.page,
      result.pageSize,
      '获取聊天记录成功',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('room/:roomId')
  async getRoomHistory(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 50,
  ) {
    const result = await this.chatService.getRoomHistory(roomId, page, pageSize);
    return this.responseService.paginated(
      result.messages,
      result.total,
      result.page,
      result.pageSize,
      '获取聊天记录成功',
    );
  }
}
