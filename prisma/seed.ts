import { PrismaClient } from '../libs/shared/prisma/generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据...');

  // ========== 1. 创建菜单树 ==========
  console.log('📋 创建菜单...');

  const menus = [
    // 系统管理（directory）
    { id: 1, name: '系统管理', type: 'directory', path: '/system', icon: 'Setting', sort: 1 },

    // 用户管理（menu）
    { id: 10, parentId: 1, name: '用户管理', type: 'menu', path: '/system/user', icon: 'User', sort: 1 },
    { id: 11, parentId: 10, name: '用户查询', type: 'button', permission: 'user:query', sort: 1 },
    { id: 12, parentId: 10, name: '用户新增', type: 'button', permission: 'user:create', sort: 2 },
    { id: 13, parentId: 10, name: '用户编辑', type: 'button', permission: 'user:update', sort: 3 },
    { id: 14, parentId: 10, name: '用户删除', type: 'button', permission: 'user:delete', sort: 4 },

    // 角色管理（menu）
    { id: 20, parentId: 1, name: '角色管理', type: 'menu', path: '/system/role', icon: 'Lock', sort: 2 },
    { id: 21, parentId: 20, name: '角色查询', type: 'button', permission: 'role:query', sort: 1 },
    { id: 22, parentId: 20, name: '角色新增', type: 'button', permission: 'role:create', sort: 2 },
    { id: 23, parentId: 20, name: '角色编辑', type: 'button', permission: 'role:update', sort: 3 },
    { id: 24, parentId: 20, name: '角色删除', type: 'button', permission: 'role:delete', sort: 4 },

    // 菜单管理（menu）
    { id: 30, parentId: 1, name: '菜单管理', type: 'menu', path: '/system/menu', icon: 'Menu', sort: 3 },
    { id: 31, parentId: 30, name: '菜单查询', type: 'button', permission: 'menu:query', sort: 1 },
    { id: 32, parentId: 30, name: '菜单新增', type: 'button', permission: 'menu:create', sort: 2 },
    { id: 33, parentId: 30, name: '菜单编辑', type: 'button', permission: 'menu:update', sort: 3 },
    { id: 34, parentId: 30, name: '菜单删除', type: 'button', permission: 'menu:delete', sort: 4 },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { id: menu.id },
      update: menu,
      create: menu,
    });
  }
  console.log(`  ✅ 创建 ${menus.length} 个菜单项`);

  // ========== 2. 创建角色 ==========
  console.log('🔑 创建角色...');

  const superAdminRole = await prisma.role.upsert({
    where: { code: 'super_admin' },
    update: {},
    create: {
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有所有权限',
      dataScope: 'ALL',
      sort: 1,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: {
      name: '普通用户',
      code: 'user',
      description: '基础权限',
      dataScope: 'SELF',
      sort: 2,
    },
  });
  console.log(`  ✅ 创建角色: ${superAdminRole.name}、${userRole.name}`);

  // ========== 3. 给超级管理员分配所有菜单 ==========
  console.log('🔗 分配超级管理员权限...');

  // 先清除旧的关联
  await prisma.roleMenu.deleteMany({ where: { roleId: superAdminRole.id } });

  const allMenuIds = menus.map((m) => m.id);
  await prisma.roleMenu.createMany({
    data: allMenuIds.map((menuId) => ({
      roleId: superAdminRole.id,
      menuId,
    })),
    skipDuplicates: true,
  });
  console.log(`  ✅ 超级管理员分配 ${allMenuIds.length} 个菜单权限`);

  // 给普通用户分配基础权限（查看用户列表 + 查看自己的信息）
  await prisma.roleMenu.deleteMany({ where: { roleId: userRole.id } });
  await prisma.roleMenu.createMany({
    data: [
      { roleId: userRole.id, menuId: 1 },   // 系统管理
      { roleId: userRole.id, menuId: 10 },  // 用户管理
      { roleId: userRole.id, menuId: 11 },  // 用户查询
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ 普通用户分配基础权限');

  // ========== 4. 创建超级管理员账号 ==========
  console.log('👤 创建超级管理员账号...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '超级管理员',
      password: hashedPassword,
      status: true,
    },
  });

  // 分配超级管理员角色
  await prisma.userRole.upsert({
    where: { id: await prisma.userRole
      .findFirst({ where: { userId: admin.id, roleId: superAdminRole.id } })
      .then((ur) => ur?.id ?? -1) },
    update: {},
    create: {
      userId: admin.id,
      roleId: superAdminRole.id,
    },
  });
  console.log(`  ✅ 管理员账号: admin@example.com / admin123`);

  // ========== 5. 创建测试普通用户 ==========
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '测试用户',
      password: hashedPassword,
      status: true,
    },
  });

  await prisma.userRole.upsert({
    where: { id: await prisma.userRole
      .findFirst({ where: { userId: testUser.id, roleId: userRole.id } })
      .then((ur) => ur?.id ?? -1) },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  });
  console.log(`  ✅ 测试账号: test@example.com / admin123`);

  console.log('\n🎉 种子数据创建完成！');
  console.log('─────────────────────────────────');
  console.log('管理员: admin@example.com / admin123 (超级管理员)');
  console.log('测试号: test@example.com / admin123 (普通用户)');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
