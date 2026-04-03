import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { RoleController } from './role.controller';
import { MenuController } from './menu.controller';
import { InitController } from './init.controller';

@Module({
  controllers: [RoleController, MenuController, InitController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
