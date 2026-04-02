import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BusinessException, ErrorCode } from '@app/shared';
import { UserService } from '../../user/src/user.service';
import { PermissionService } from '../../permission/src/permission.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.create({
      email: dto.email,
      name: dto.name,
      password: dto.password,
    });
    const token = this.generateToken(user.id, user.email);
    return { user, access_token: token };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new BusinessException(
        ErrorCode.USER_INVALID_CREDENTIALS,
        '用户名或密码错误',
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new BusinessException(
        ErrorCode.USER_INVALID_CREDENTIALS,
        '用户名或密码错误',
      );
    }

    const token = this.generateToken(user.id, user.email);

    // 获取角色、权限、菜单
    const roles = await this.permissionService.getUserRoles(user.id);
    const permissions = await this.permissionService.getUserPermissions(user.id);
    const menus = await this.permissionService.getUserMenuTree(user.id);

    return {
      access_token: token,
      user: { id: user.id, email: user.email, name: user.name },
      roles: roles.map((r) => r.code),
      permissions,
      menus,
    };
  }

  private generateToken(userId: number, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}
