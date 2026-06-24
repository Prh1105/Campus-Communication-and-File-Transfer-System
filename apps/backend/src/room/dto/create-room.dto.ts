import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;
}
