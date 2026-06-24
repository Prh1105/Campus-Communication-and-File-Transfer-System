import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export type MessageType = 'text' | 'image' | 'file' | 'system';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsEnum(['text', 'image', 'file', 'system'])
  type: MessageType = 'text';

  @IsNumber()
  @IsOptional()
  receiverId?: number;

  @IsNumber()
  @IsOptional()
  roomId?: number;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;
}
