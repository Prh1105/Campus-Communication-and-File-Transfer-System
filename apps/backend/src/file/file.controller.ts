import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileValidationPipe } from './file-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseService } from '@libs/shared';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Req() req: any,
  ) {
    const fileInfo = await this.fileService.saveFile(file, req.user.id);
    return this.responseService.success(fileInfo, '文件上传成功', 201);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: any, @Query('my') my?: string) {
    const files = await this.fileService.findAll(my === 'true' ? req.user.id : undefined);
    return this.responseService.success(files, '获取文件列表成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const file = await this.fileService.findById(id);
    return this.responseService.success(file, '获取文件详情成功');
  }
}
