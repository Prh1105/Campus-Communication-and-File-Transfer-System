import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseService } from '@libs/shared';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return this.responseService.success(users, '获取用户列表成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get('online')
  async findOnline() {
    const users = await this.usersService.findOnline();
    return this.responseService.success(users, '获取在线用户成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return this.responseService.success(user, '获取用户详情成功');
  }
}
