import { IsString, IsOptional, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DataScope {
  ALL = 'ALL',
  SELF = 'SELF',
}

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '普通用户' })
  @IsString()
  name: string;

  @ApiProperty({ description: '角色编码', example: 'user' })
  @IsString()
  code: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '数据范围', enum: DataScope, default: DataScope.SELF })
  @IsEnum(DataScope)
  dataScope: DataScope = DataScope.SELF;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
