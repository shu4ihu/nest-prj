import { IsString, IsOptional, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DataScope } from './create-role.dto';

export class UpdateRoleDto {
  @ApiProperty({ description: '角色名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '角色编码', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '数据范围', enum: DataScope, required: false })
  @IsOptional()
  @IsEnum(DataScope)
  dataScope?: DataScope;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
