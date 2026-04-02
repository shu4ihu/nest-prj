import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignMenusDto } from './dto/assign-menus.dto';
import { RequirePermission } from '../../auth/src/decorators/require-permission.decorator';

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermission('role:query')
  @ApiOperation({ summary: '角色列表' })
  findAll() {
    return this.permissionService.findAllRoles();
  }

  @Get(':id')
  @RequirePermission('role:query')
  @ApiOperation({ summary: '角色详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findRoleById(id);
  }

  @Post()
  @RequirePermission('role:create')
  @ApiOperation({ summary: '创建角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.permissionService.createRole(dto);
  }

  @Patch(':id')
  @RequirePermission('role:update')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.permissionService.updateRole(id, dto);
  }

  @Delete(':id')
  @RequirePermission('role:delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.deleteRole(id);
  }

  @Post(':id/menus')
  @RequirePermission('role:update')
  @ApiOperation({ summary: '给角色分配菜单/权限' })
  assignMenus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignMenusDto,
  ) {
    return this.permissionService.assignMenus(id, dto.menuIds);
  }
}
