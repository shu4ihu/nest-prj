import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { Public } from '../../auth/src/decorators/public.decorator';

@ApiTags('系统初始化')
@Controller('init')
export class InitController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('seed')
  @Public()
  @ApiOperation({ summary: '初始化种子数据（角色、菜单、管理员账号）' })
  seed() {
    return this.permissionService.seed();
  }
}
