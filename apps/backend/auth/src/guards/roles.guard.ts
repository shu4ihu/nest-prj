import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

interface RequestUser {
  id: number;
  roles: { code: string; dataScope: string }[];
  permissions: string[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 没有标记 @RequirePermission → 仅需登录即可
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) return false;

    // 超级管理员直接放行
    const isSuperAdmin = user.roles?.some(
      (role) => role.code === 'super_admin',
    );
    if (isSuperAdmin) return true;

    // 检查权限
    const hasPermission = requiredPermissions.every((p) =>
      user.permissions?.includes(p),
    );

    if (!hasPermission) {
      throw new ForbiddenException('无权限访问');
    }

    return true;
  }
}
