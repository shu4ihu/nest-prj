import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({ description: '角色ID列表', example: [1, 2] })
  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];
}
