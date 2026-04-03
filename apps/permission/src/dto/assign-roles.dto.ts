import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({ description: '角色ID列表', example: [1, 2] })
  @IsArray({ message: '角色ID列表必须为数组' })
  @IsInt({ each: true, message: '每个角色ID必须为整数' })
  roleIds: number[];
}
