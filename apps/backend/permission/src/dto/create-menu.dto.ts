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
  @IsInt({ message: '父级ID必须为整数' })
  parentId?: number;

  @ApiProperty({ description: '菜单/按钮名称', example: '用户管理' })
  @IsString({ message: '名称必须为字符串' })
  name: string;

  @ApiProperty({ description: '类型', example: 'menu', enum: ['directory', 'menu', 'button'] })
  @IsIn(['directory', 'menu', 'button'], { message: '类型只能是 directory、menu 或 button' })
  type: string;

  @ApiProperty({ description: '权限标识', required: false, example: 'user:create' })
  @IsOptional()
  @IsString({ message: '权限标识必须为字符串' })
  permission?: string;

  @ApiProperty({ description: '路由路径', required: false, example: '/system/user' })
  @IsOptional()
  @IsString({ message: '路由路径必须为字符串' })
  path?: string;

  @ApiProperty({ description: '图标', required: false })
  @IsOptional()
  @IsString({ message: '图标必须为字符串' })
  icon?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt({ message: '排序必须为整数' })
  sort?: number;

  @ApiProperty({ description: '是否可见', required: false })
  @IsOptional()
  @IsBoolean({ message: '是否可见必须为布尔值' })
  visible?: boolean;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsBoolean({ message: '状态必须为布尔值' })
  status?: boolean;
}
