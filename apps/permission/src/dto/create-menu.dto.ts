import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ description: '父级ID', required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: '菜单/按钮名称', example: '用户管理' })
  @IsString()
  name: string;

  @ApiProperty({ description: '类型', example: 'menu', enum: ['directory', 'menu', 'button'] })
  @IsIn(['directory', 'menu', 'button'])
  type: string;

  @ApiProperty({ description: '权限标识', required: false, example: 'user:create' })
  @IsOptional()
  @IsString()
  permission?: string;

  @ApiProperty({ description: '路由路径', required: false, example: '/system/user' })
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
