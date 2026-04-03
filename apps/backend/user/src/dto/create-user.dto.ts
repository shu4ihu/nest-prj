import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '用户名', example: '张三' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须为字符串' })
  name: string;

  @ApiProperty({ description: '密码（至少6位）', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须为字符串' })
  @MinLength(6, { message: '密码至少6位' })
  password: string;
}
