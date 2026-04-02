import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService, BusinessException, ErrorCode } from '@app/shared';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, status: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND, '用户不存在');
    }
    return user;
  }

  /** 获取用户信息及其角色和权限（用于 JWT validate） */
  async findWithPermissions(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, status: true },
    });
    if (!user) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND, '用户不存在');
    }

    // 获取用户角色
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: id },
      include: { role: { select: { id: true, code: true, name: true, dataScope: true } } },
    });

    const roles = userRoles.map((ur) => ({
      id: ur.role.id,
      code: ur.role.code,
      name: ur.role.name,
      dataScope: ur.role.dataScope,
    }));

    // 获取权限标识
    const roleIds = roles.map((r) => r.id);
    const isSuperAdmin = roles.some((r) => r.code === 'super_admin');

    let permissions: string[] = [];
    if (isSuperAdmin) {
      const allMenus = await this.prisma.menu.findMany({
        where: { permission: { not: null }, status: true },
        select: { permission: true },
      });
      permissions = allMenus.map((m) => m.permission!);
    } else if (roleIds.length > 0) {
      const roleMenus = await this.prisma.roleMenu.findMany({
        where: { roleId: { in: roleIds } },
        include: { menu: { select: { permission: true, status: true } } },
      });
      permissions = roleMenus
        .filter((rm) => rm.menu.permission && rm.menu.status)
        .map((rm) => rm.menu.permission!);
      // 去重
      permissions = [...new Set(permissions)];
    }

    return { ...user, roles, permissions };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BusinessException(
        ErrorCode.USER_ALREADY_EXISTS,
        '邮箱已被注册',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, name: true },
    });
  }

  async remove(id: number) {
    await this.findById(id);
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, name: true },
    });
  }

  async findAll(page = 1, pageSize = 10, currentUserId?: number, dataScope?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    // 数据权限过滤
    if (dataScope === 'SELF' && currentUserId) {
      where.id = currentUserId;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: { id: true, email: true, name: true, status: true, createdAt: true },
        orderBy: { id: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async createBatch(count: number) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const users = Array.from({ length: count }, (_, i) => ({
      email: `user_${i + 1}@example.com`,
      name: `用户_${i + 1}`,
      password: hashedPassword,
    }));
    await this.prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });
    return { created: count };
  }

  /** 给用户分配角色 */
  async assignRoles(userId: number, roleIds: number[]) {
    await this.findById(userId);
    // 删除旧角色
    await this.prisma.userRole.deleteMany({ where: { userId } });
    // 分配新角色
    if (roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId })),
      });
    }
    return { userId, roleIds };
  }
}
