import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { AssignRolesDto } from '../../permission/src/dto/assign-roles.dto';
import { CurrentUser } from '../../auth/src/decorators/current-user.decorator';
import { Public } from '../../auth/src/decorators/public.decorator';
import { RequirePermission } from '../../auth/src/decorators/require-permission.decorator';
import { PaginationDto } from '@app/shared';

@ApiTags('用户')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  getMe(@CurrentUser() user: any) {
    return this.userService.findById(user.id);
  }

  @Get()
  @RequirePermission('user:query')
  @ApiOperation({ summary: '用户列表' })
  findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
  ) {
    const dataScope = user.roles?.[0]?.dataScope ?? 'SELF';
    return this.userService.findAll(pagination.page, pagination.pageSize, user.id, dataScope);
  }

  @Post('getList')
  @RequirePermission('user:query')
  @ApiOperation({ summary: '分页获取用户列表（支持邮箱/姓名模糊查询）' })
  getList(@Body() user: QueryUserDto, @CurrentUser() currentUser: any) {
    Logger.log(user);
    Logger.log(currentUser.id);
    return this.userService.getList(user.page, user.pageSize, user.email, user.name, currentUser.id, user.status);
  }

  @Get(':id')
  @RequirePermission('user:query')
  @ApiOperation({ summary: '获取指定用户' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @RequirePermission('user:update')
  @ApiOperation({ summary: '更新用户信息' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Post(':id/roles')
  @RequirePermission('user:update')
  @ApiOperation({ summary: '给用户分配角色' })
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
  ) {
    return this.userService.assignRoles(id, dto.roleIds);
  }

  @Post('seed')
  @Public()
  @ApiOperation({ summary: '批量创建测试用户' })
  seed() {
    return this.userService.createBatch(100);
  }
}
