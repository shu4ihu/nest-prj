import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '用户名', example: '张三' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '密码（至少6位）', example: '123456' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
