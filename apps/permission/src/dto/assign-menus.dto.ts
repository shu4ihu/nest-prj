import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignMenusDto {
  @ApiProperty({ description: '菜单ID列表', example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  menuIds: number[];
}
