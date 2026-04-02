/**
 * 业务错误码枚举
 *
 * 命名规范：模块_错误描述（全大写下划线）
 */
export enum ErrorCode {
  // 通用错误 10xxx
  // 未知错误
  UNKNOWN = 10000,
  // 验证失败
  VALIDATION_FAILED = 10001,
  // 未授权
  UNAUTHORIZED = 10002,
  // 禁止访问
  FORBIDDEN = 10003,
  // 未找到
  NOT_FOUND = 10004,
  // 内部错误
  INTERNAL_ERROR = 10005,

  // 用户模块 20xxx
  // 用户未找到
  USER_NOT_FOUND = 20001,
  // 用户已存在
  USER_ALREADY_EXISTS = 20002,
  // 用户无效凭证
  USER_INVALID_CREDENTIALS = 20003,

  // 权限模块 30xxx
  // 无权限访问
  PERMISSION_DENIED = 30001,
  // 角色未找到
  ROLE_NOT_FOUND = 30002,
  // 角色编码已存在
  ROLE_CODE_EXISTS = 30003,
  // 菜单未找到
  MENU_NOT_FOUND = 30004,
  // 权限标识已存在
  PERMISSION_EXISTS = 30005,
}
