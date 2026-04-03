import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@app/shared';

export class QueryUserDto extends PaginationDto {
  @ApiProperty({ description: '邮箱（模糊搜索）', required: false })
  @IsOptional()
  @IsString({ message: '邮箱必须为字符串' })
  email?: string;

  @ApiProperty({ description: '用户名（模糊搜索）', required: false })
  @IsOptional()
  @IsString({ message: '用户名必须为字符串' })
  name?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString({ message: '状态必须为字符串' })
  status?: string;
}
