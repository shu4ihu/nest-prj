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
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { RequirePermission } from '../../auth/src/decorators/require-permission.decorator';

@ApiTags('菜单管理')
@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermission('menu:query')
  @ApiOperation({ summary: '菜单列表（平铺）' })
  findAll() {
    return this.permissionService.findAllMenus();
  }

  @Get('tree')
  @RequirePermission('menu:query')
  @ApiOperation({ summary: '菜单树形结构' })
  findTree() {
    return this.permissionService.findMenuTree();
  }

  @Get(':id')
  @RequirePermission('menu:query')
  @ApiOperation({ summary: '菜单详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findMenuById(id);
  }

  @Post()
  @RequirePermission('menu:create')
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() dto: CreateMenuDto) {
    return this.permissionService.createMenu(dto);
  }

  @Patch(':id')
  @RequirePermission('menu:update')
  @ApiOperation({ summary: '更新菜单' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.permissionService.updateMenu(id, dto);
  }

  @Delete(':id')
  @RequirePermission('menu:delete')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.deleteMenu(id);
  }
}
