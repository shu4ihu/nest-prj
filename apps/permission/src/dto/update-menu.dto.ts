import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiProperty({ description: '父级ID', required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: '名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '类型', required: false, enum: ['directory', 'menu', 'button'] })
  @IsOptional()
  @IsIn(['directory', 'menu', 'button'])
  type?: string;

  @ApiProperty({ description: '权限标识', required: false })
  @IsOptional()
  @IsString()
  permission?: string;

  @ApiProperty({ description: '路由路径', required: false })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ description: '图标', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiProperty({ description: '是否可见', required: false })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
