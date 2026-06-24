import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/vnd.rar',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文件类型: ${file.mimetype}。支持的类型: ${ALLOWED_FILE_TYPES.join(', ')}`,
      );
    }

    return file;
  }
}
