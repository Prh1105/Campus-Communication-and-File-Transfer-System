import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '@libs/shared';

// 简易 UUID v4 生成
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable()
export class FileService {
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, userId: number) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${generateUUID()}${ext}`;
    const uploadPath = path.join(this.uploadDir, uniqueName);

    fs.writeFileSync(uploadPath, file.buffer);

    const fileInfo = await this.prisma.fileInfo.create({
      data: {
        originalName: file.originalname,
        fileName: uniqueName,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${uniqueName}`,
        uploadedById: userId,
      },
    });

    return fileInfo;
  }

  async findAll(userId?: number) {
    return this.prisma.fileInfo.findMany({
      where: userId ? { uploadedById: userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const file = await this.prisma.fileInfo.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('文件不存在');
    return file;
  }
}
