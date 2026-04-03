import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须为字符串' })
  password: string;
}
