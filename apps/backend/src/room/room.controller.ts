import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseService } from '@libs/shared';

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const rooms = await this.roomService.findAll();
    return this.responseService.success(rooms, '获取房间列表成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomService.findById(id);
    return this.responseService.success(room, '获取房间详情成功');
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateRoomDto, @Req() req: any) {
    const room = await this.roomService.create(dto, req.user.id);
    return this.responseService.success(room, '创建房间成功', 201);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async findRoomMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 50,
  ) {
    const result = await this.roomService.findRoomMessages(id, page, pageSize);
    return this.responseService.paginated(
      result.messages,
      result.total,
      result.page,
      result.pageSize,
      '获取聊天记录成功',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getMembers(@Param('id', ParseIntPipe) id: number) {
    const members = await this.roomService.getMembers(id);
    return this.responseService.success(members, '获取房间成员成功');
  }
}
