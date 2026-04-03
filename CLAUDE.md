# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
# 开发
pnpm start:dev          # 启动开发服务器（watch 模式）
pnpm start:debug        # 带 debugger 的开发服务器

# 构建
pnpm build              # 编译整个 monorepo

# 测试
pnpm test               # 运行所有单元测试
pnpm test -- --watch    # watch 模式
pnpm test -- --testPathPattern=auth  # 运行指定模块的测试
pnpm test:e2e           # E2E 测试（仅 server 应用）
pnpm test:cov           # 带覆盖率报告

# 代码质量
pnpm lint               # ESLint + 自动修复
pnpm format             # Prettier 格式化

# 数据库（Prisma）
pnpm db:gen             # 生成 Prisma Client
pnpm db:push            # 推送 schema 到数据库
```

## 项目架构

这是一个 **NestJS CLI monorepo**（非 Nx/Lerna），通过 `nest-cli.json` 管理。

### 目录结构

```
nest-prj/
├── apps/
│   ├── backend/           ← 后端（NestJS monorepo）
│   │   ├── server/        主应用入口，组装所有模块
│   │   ├── auth/          JWT 认证（注册/登录/Token 签发）+ 全局守卫 + 装饰器
│   │   ├── user/          用户 CRUD（增删改查/角色分配）
│   │   └── permission/    角色/菜单 CRUD + 权限查询
│   └── web/               ← 前端（Next.js + shadcn + React）
├── libs/
│   └── shared/            共享库：PrismaService、异常处理、响应拦截器、分页工具
```

| 项目 | 路径 | 别名 | 说明 |
|------|------|------|------|
| `server` | `apps/backend/server/` | — | 主应用入口，端口 3000，组装所有模块 |
| `auth` | `apps/backend/auth/` | `@app/auth` | JWT 认证 + 全局守卫 + 装饰器 |
| `user` | `apps/backend/user/` | `@app/user` | 用户 CRUD + 角色分配 |
| `permission` | `apps/backend/permission/` | `@app/permission` | 角色/菜单 CRUD + 权限查询 |
| `shared` | `libs/shared/` | `@app/shared` | PrismaService、异常处理、响应拦截器、分页工具 |
| `web` | `apps/web/` | — | Next.js + shadcn + React 前端 |

### 模块依赖关系

```
AppModule (nest-prj)
  ├── SharedModule (@Global)
  ├── UserModule           → PrismaService
  ├── PermissionModule     → PrismaService
  ├── AuthModule           → UserModule + PermissionModule
  │   ├── JwtAuthGuard     （全局守卫：JWT 认证）
  │   ├── RolesGuard       （全局守卫：权限检查）
  │   ├── @Public()        （免鉴权）
  │   ├── @RequirePermission('xxx')  （接口权限）
  │   └── @CurrentUser()   （获取当前用户）
  └── HealthModule
```

### 关键架构决策

- **SharedModule 是 `@Global()` 模块** — PrismaService 和 ConfigModule 在整个应用中无需显式导入即可使用
- **Prisma v7 + MariaDB** — schema 位于 `libs/shared/prisma/schema.prisma`，使用 `@prisma/adapter-mariadb` 适配器
- **JWT 全局鉴权** — JwtAuthGuard + RolesGuard 双守卫链。`@Public()` 免鉴权，`@RequirePermission('user:delete')` 控制接口权限
- **RBAC 权限模型** — User → UserRole → Role → RoleMenu → Menu（树形：directory/menu/button）。超级管理员（code='super_admin'）自动放行所有权限
- **数据权限** — Role.dataScope 字段（ALL=全部数据 / SELF=仅自己），在 Service 层查询时根据 dataScope 过滤
- **按钮权限** — Menu 表中 type='button' 的 permission 字段（如 `user:create`）同时绑定 Controller 接口和前端按钮显示
- **JWT payload** — `JwtStrategy.validate()` 返回含 roles/permissions 的完整用户对象，RolesGuard 从 request.user 校验权限
- **全局异常处理** — 错误码分段：通用 10xxx、用户 20xxx、权限 30xxx
- **统一响应格式** — `TransformInterceptor` 包装 `{ code: 0, message, data, timestamp }`
- **路径别名** — `@app/shared` → `libs/shared/src/`、`@app/auth` → `apps/backend/auth/src/`、`@app/user` → `apps/backend/user/src/`、`@app/permission` → `apps/backend/permission/src/`。跨模块引用统一使用路径别名、`@app/auth` → `apps/backend/auth/src/`、`@app/user` → `apps/backend/user/src/`、`@app/permission` → `apps/backend/permission/src/`。跨模块引用使用别名而非相对路径

### 全局守卫注册顺序（main.ts）

```
useGlobalGuards → JwtAuthGuard（认证）→ RolesGuard（权限）
```

### 接口权限使用方式

```typescript
// 免鉴权
@Public()
@Post('seed')
seed() { ... }

// 需要登录但无需特定权限
@Get('me')
getMe(@CurrentUser() user) { ... }

// 需要特定权限（与 Menu 表 button 的 permission 字段一致）
@RequirePermission('user:delete')
@Delete(':id')
remove(@Param('id') id: number) { ... }
```

### 新增业务模块权限的方式

1. 在 `schema.prisma` 的 Menu 表中插入 button 类型记录（permission='module:action'）
2. 通过 `POST /role/:id/menus` 给角色分配权限
3. Controller 上添加 `@RequirePermission('module:action')`
4. 在 `error-codes.ts` 中按分段（30xxx、40xxx...）添加错误码

### 通用分页

分页工具位于 `libs/shared/src/pagination/pagination.dto.ts`，通过 `@app/shared` 导入。

**Controller 用法**：
```typescript
import { PaginationDto } from '@app/shared';

@Get()
findAll(@Query() pagination: PaginationDto) {
  return this.service.findAll(pagination.page, pagination.pageSize);
}
```

**Service 用法**：
```typescript
import { paginate, PaginatedResult } from '@app/shared';

async findAll(page = 1, pageSize = 10): Promise<PaginatedResult<T>> {
  return paginate(
    (skip, take) => this.prisma.xxx.findMany({ where, skip, take, ... }),
    () => this.prisma.xxx.count({ where }),
    page,
    pageSize,
  );
}
```

**返回格式**：`{ items, total, page, pageSize, totalPages }`

**带搜索条件的分页**：继承 `PaginationDto` 扩展查询 DTO，如 `QueryUserDto` 增加了 `email`、`name` 字段，Service 中通过 `where: { email: { contains: query.email } }` 实现模糊搜索

### 环境变量

`.env` 文件位于项目根目录：
- `DATABASE_URL` — MariaDB 连接字符串
- `JWT_SECRET` — JWT 签名密钥
- `JWT_EXPIRATION` — Token 过期时间

### 已知配置问题

- `apps/backend/auth/src/auth.controller.spec.ts` 测试文件引用旧代码，需更新
