import { Injectable } from '@nestjs/common';
import { PrismaService, BusinessException, ErrorCode } from '@app/shared';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  // ========== 角色 CRUD ==========

  async findAllRoles() {
    return this.prisma.role.findMany({
      orderBy: { sort: 'asc' },
      include: { _count: { select: { users: true, menus: true } } },
    });
  }

  async findRoleById(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { menus: { select: { menuId: true } } },
    });
    if (!role) throw new BusinessException(ErrorCode.ROLE_NOT_FOUND, '角色不存在');
    return {
      ...role,
      menuIds: role.menus.map((rm) => rm.menuId),
    };
  }

  async createRole(data: { name: string; code: string; description?: string; dataScope?: string; sort?: number; status?: boolean }) {
    const existing = await this.prisma.role.findUnique({ where: { code: data.code } });
    if (existing) throw new BusinessException(ErrorCode.ROLE_CODE_EXISTS, '角色编码已存在');
    return this.prisma.role.create({ data });
  }

  async updateRole(id: number, data: { name?: string; code?: string; description?: string; dataScope?: string; sort?: number; status?: boolean }) {
    await this.findRoleById(id);
    if (data.code) {
      const existing = await this.prisma.role.findUnique({ where: { code: data.code } });
      if (existing && existing.id !== id) throw new BusinessException(ErrorCode.ROLE_CODE_EXISTS, '角色编码已存在');
    }
    return this.prisma.role.update({ where: { id }, data });
  }

  async deleteRole(id: number) {
    await this.findRoleById(id);
    await this.prisma.roleMenu.deleteMany({ where: { roleId: id } });
    await this.prisma.userRole.deleteMany({ where: { roleId: id } });
    return this.prisma.role.delete({ where: { id } });
  }

  async assignMenus(roleId: number, menuIds: number[]) {
    await this.findRoleById(roleId);
    await this.prisma.roleMenu.deleteMany({ where: { roleId } });
    if (menuIds.length > 0) {
      await this.prisma.roleMenu.createMany({
        data: menuIds.map((menuId) => ({ roleId, menuId })),
      });
    }
    return { roleId, menuIds };
  }

  // ========== 菜单 CRUD ==========

  async findAllMenus() {
    return this.prisma.menu.findMany({ orderBy: { sort: 'asc' } });
  }

  async findMenuTree() {
    const menus = await this.prisma.menu.findMany({
      orderBy: { sort: 'asc' },
      where: { status: true },
    });
    return this.buildTree(menus);
  }

  async findMenuById(id: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new BusinessException(ErrorCode.MENU_NOT_FOUND, '菜单不存在');
    return menu;
  }

  async createMenu(data: {
    parentId?: number; name: string; type: string; permission?: string;
    path?: string; icon?: string; sort?: number; visible?: boolean; status?: boolean;
  }) {
    if (data.permission) {
      const existing = await this.prisma.menu.findUnique({ where: { permission: data.permission } });
      if (existing) throw new BusinessException(ErrorCode.PERMISSION_EXISTS, '权限标识已存在');
    }
    return this.prisma.menu.create({ data });
  }

  async updateMenu(id: number, data: {
    parentId?: number; name?: string; type?: string; permission?: string;
    path?: string; icon?: string; sort?: number; visible?: boolean; status?: boolean;
  }) {
    await this.findMenuById(id);
    if (data.permission) {
      const existing = await this.prisma.menu.findUnique({ where: { permission: data.permission } });
      if (existing && existing.id !== id) throw new BusinessException(ErrorCode.PERMISSION_EXISTS, '权限标识已存在');
    }
    return this.prisma.menu.update({ where: { id }, data });
  }

  async deleteMenu(id: number) {
    await this.findMenuById(id);
    // 检查子菜单
    const children = await this.prisma.menu.count({ where: { parentId: id } });
    if (children > 0) throw new BusinessException(ErrorCode.VALIDATION_FAILED, '存在子菜单，无法删除');
    await this.prisma.roleMenu.deleteMany({ where: { menuId: id } });
    return this.prisma.menu.delete({ where: { id } });
  }

  // ========== 权限查询 ==========

  /** 获取用户的角色列表 */
  async getUserRoles(userId: number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ({
      id: ur.role.id,
      code: ur.role.code,
      name: ur.role.name,
      dataScope: ur.role.dataScope,
    }));
  }

  /** 获取用户的权限标识列表 */
  async getUserPermissions(userId: number): Promise<string[]> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true, role: { select: { code: true } } },
    });

    // 超级管理员返回所有权限
    const isSuperAdmin = roles.some((r) => r.role.code === 'super_admin');
    if (isSuperAdmin) {
      const allMenus = await this.prisma.menu.findMany({
        where: { permission: { not: null }, status: true },
        select: { permission: true },
      });
      return allMenus.map((m) => m.permission!);
    }

    // 普通用户：通过角色 → 菜单获取权限
    const roleIds = roles.map((r) => r.roleId);
    const roleMenus = await this.prisma.roleMenu.findMany({
      where: { roleId: { in: roleIds } },
      include: { menu: { select: { permission: true, status: true } } },
    });
    return roleMenus
      .filter((rm) => rm.menu.permission && rm.menu.status)
      .map((rm) => rm.menu.permission!);
  }

  /** 获取用户的菜单树（用于前端渲染） */
  async getUserMenuTree(userId: number) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true, role: { select: { code: true } } },
    });

    let menuIds: number[];

    const isSuperAdmin = roles.some((r) => r.role.code === 'super_admin');
    if (isSuperAdmin) {
      // 超级管理员获取所有菜单
      const allMenus = await this.prisma.menu.findMany({
        where: { status: true },
        select: { id: true },
      });
      menuIds = allMenus.map((m) => m.id);
    } else {
      const roleIds = roles.map((r) => r.roleId);
      const roleMenus = await this.prisma.roleMenu.findMany({
        where: { roleId: { in: roleIds } },
        select: { menuId: true },
      });
      menuIds = roleMenus.map((rm) => rm.menuId);
    }

    // 获取所有相关菜单（含父级，保证树结构完整）
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: menuIds }, status: true },
      orderBy: { sort: 'asc' },
    });

    // 补充父级菜单（确保树结构完整）
    const allParentIds = new Set<number>();
    menus.forEach((m) => { if (m.parentId) allParentIds.add(m.parentId); });
    const missingIds = [...allParentIds].filter((pid) => !menus.some((m) => m.id === pid));
    if (missingIds.length > 0) {
      const parents = await this.prisma.menu.findMany({
        where: { id: { in: missingIds }, status: true },
      });
      menus.push(...parents);
    }

    return this.buildTree(menus);
  }

  // ========== 初始化种子数据 ==========

  async seed() {
    // 检查是否已初始化
    // const roleCount = await this.prisma.role.count();
    // if (roleCount > 0) {
    //   return { message: '种子数据已存在，跳过初始化' };
    // }

    // 1. 创建菜单
    // const menus = [
    //   { id: 1, name: '系统管理', type: 'directory', path: '/system', icon: 'Setting', sort: 1 },
    //   { id: 10, parentId: 1, name: '用户管理', type: 'menu', path: '/system/user', icon: 'User', sort: 1 },
    //   { id: 11, parentId: 10, name: '用户查询', type: 'button', permission: 'user:query', sort: 1 },
    //   { id: 12, parentId: 10, name: '用户新增', type: 'button', permission: 'user:create', sort: 2 },
    //   { id: 13, parentId: 10, name: '用户编辑', type: 'button', permission: 'user:update', sort: 3 },
    //   { id: 14, parentId: 10, name: '用户删除', type: 'button', permission: 'user:delete', sort: 4 },
    //   { id: 20, parentId: 1, name: '角色管理', type: 'menu', path: '/system/role', icon: 'Lock', sort: 2 },
    //   { id: 21, parentId: 20, name: '角色查询', type: 'button', permission: 'role:query', sort: 1 },
    //   { id: 22, parentId: 20, name: '角色新增', type: 'button', permission: 'role:create', sort: 2 },
    //   { id: 23, parentId: 20, name: '角色编辑', type: 'button', permission: 'role:update', sort: 3 },
    //   { id: 24, parentId: 20, name: '角色删除', type: 'button', permission: 'role:delete', sort: 4 },
    //   { id: 30, parentId: 1, name: '菜单管理', type: 'menu', path: '/system/menu', icon: 'Menu', sort: 3 },
    //   { id: 31, parentId: 30, name: '菜单查询', type: 'button', permission: 'menu:query', sort: 1 },
    //   { id: 32, parentId: 30, name: '菜单新增', type: 'button', permission: 'menu:create', sort: 2 },
    //   { id: 33, parentId: 30, name: '菜单编辑', type: 'button', permission: 'menu:update', sort: 3 },
    //   { id: 34, parentId: 30, name: '菜单删除', type: 'button', permission: 'menu:delete', sort: 4 },
    // ];

    // for (const menu of menus) {
    //   await this.prisma.menu.create({ data: menu });
    // }

    // // 2. 创建角色
    // const superAdminRole = await this.prisma.role.create({
    //   data: {
    //     name: '超级管理员',
    //     code: 'super_admin',
    //     description: '拥有所有权限',
    //     dataScope: 'ALL',
    //     sort: 1,
    //   },
    // });

    // const userRole = await this.prisma.role.create({
    //   data: {
    //     name: '普通用户',
    //     code: 'user',
    //     description: '基础权限',
    //     dataScope: 'SELF',
    //     sort: 2,
    //   },
    // });

    // for (let i = 0; i < 100; i++) {
    //   await this.prisma.user.create({
    //     data: {
    //       email: `user_${i}@example.com`,
    //       name: `普通用户${i}`,
    //       password: (123456).toString(),
    //     },
    //   });
    // }

    // 3. 超级管理员分配所有菜单
    // await this.prisma.roleMenu.createMany({
    //   data: menus.map((m) => ({ roleId: superAdminRole.id, menuId: m.id })),
    // });

    // // 普通用户分配基础权限
    // await this.prisma.roleMenu.createMany({
    //   data: [
    //     { roleId: userRole.id, menuId: 1 },
    //     { roleId: userRole.id, menuId: 10 },
    //     { roleId: userRole.id, menuId: 11 },
    //   ],
    // });

    // // 4. 创建超级管理员账号
    // const bcrypt = await import('bcrypt');
    // const hashedPassword = await bcrypt.hash('admin123', 10);

    // const admin = await this.prisma.user.create({
    //   data: {
    //     email: 'admin@example.com',
    //     name: '超级管理员',
    //     password: hashedPassword,
    //   },
    // });
    // await this.prisma.userRole.create({
    //   data: { userId: admin.id, roleId: superAdminRole.id },
    // });

    // // 5. 创建测试用户
    // const testUser = await this.prisma.user.create({
    //   data: {
    //     email: 'test@example.com',
    //     name: '测试用户',
    //     password: hashedPassword,
    //   },
    // });
    // await this.prisma.userRole.create({
    //   data: { userId: testUser.id, roleId: userRole.id },
    // });

    return {
      message: '初始化完成',
      data: {
        // roles: [superAdminRole.name, userRole.name],
        // menus: menus.length,
        accounts: [
          { email: 'admin@example.com', password: 'admin123', role: '超级管理员' },
          { email: 'test@example.com', password: 'admin123', role: '普通用户' },
        ],
      },
    };
  }

  // ========== 工具方法 ==========

  private buildTree(menus: any[], parentId: number | null = null): any[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .map((m) => ({
        ...m,
        children: this.buildTree(menus, m.id),
      }))
      .filter((m) => m.type !== 'button' || m.children.length > 0 || m.type === 'button');
  }
}
