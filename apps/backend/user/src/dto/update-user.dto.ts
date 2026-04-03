import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString({ message: '用户名必须为字符串' })
  name?: string;
}
