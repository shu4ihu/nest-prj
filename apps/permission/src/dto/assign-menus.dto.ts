import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignMenusDto {
  @ApiProperty({ description: '菜单ID列表', example: [1, 2, 3] })
  @IsArray({ message: '菜单ID列表必须为数组' })
  @IsInt({ each: true, message: '每个菜单ID必须为整数' })
  menuIds: number[];
}
