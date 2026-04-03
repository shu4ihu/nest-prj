import { IsString, IsOptional, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DataScope } from './create-role.dto';

export class UpdateRoleDto {
  @ApiProperty({ description: '角色名称', required: false })
  @IsOptional()
  @IsString({ message: '角色名称必须为字符串' })
  name?: string;

  @ApiProperty({ description: '角色编码', required: false })
  @IsOptional()
  @IsString({ message: '角色编码必须为字符串' })
  code?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  description?: string;

  @ApiProperty({ description: '数据范围', enum: DataScope, required: false })
  @IsOptional()
  @IsEnum(DataScope, { message: '数据范围只能是 ALL 或 SELF' })
  dataScope?: DataScope;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt({ message: '排序必须为整数' })
  sort?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsBoolean({ message: '状态必须为布尔值' })
  status?: boolean;
}
