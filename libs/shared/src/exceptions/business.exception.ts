import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export class BusinessException extends HttpException {
  readonly code: ErrorCode;
  readonly detail?: string;

  constructor(code: ErrorCode, message: string, detail?: string) {
    super(message, BusinessException.resolveHttpStatus(code));
    this.code = code;
    this.detail = detail;
  }

  private static resolveHttpStatus(code: ErrorCode): HttpStatus {
    if (code >= 10000 && code < 20000) {
      // 通用错误
      switch (code) {
        case ErrorCode.VALIDATION_FAILED:
          return HttpStatus.BAD_REQUEST;
        case ErrorCode.UNAUTHORIZED:
          return HttpStatus.UNAUTHORIZED;
        case ErrorCode.FORBIDDEN:
          return HttpStatus.FORBIDDEN;
        case ErrorCode.NOT_FOUND:
          return HttpStatus.NOT_FOUND;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
    if (code >= 20000 && code < 30000) {
      // 用户模块
      switch (code) {
        case ErrorCode.USER_NOT_FOUND:
          return HttpStatus.NOT_FOUND;
        case ErrorCode.USER_ALREADY_EXISTS:
          return HttpStatus.CONFLICT;
        case ErrorCode.USER_INVALID_CREDENTIALS:
          return HttpStatus.UNAUTHORIZED;
        default:
          return HttpStatus.BAD_REQUEST;
      }
    }
    if (code >= 30000 && code < 40000) {
      // 权限模块
      switch (code) {
        case ErrorCode.PERMISSION_DENIED:
          return HttpStatus.FORBIDDEN;
        case ErrorCode.ROLE_NOT_FOUND:
        case ErrorCode.MENU_NOT_FOUND:
          return HttpStatus.NOT_FOUND;
        case ErrorCode.ROLE_CODE_EXISTS:
        case ErrorCode.PERMISSION_EXISTS:
          return HttpStatus.CONFLICT;
        default:
          return HttpStatus.BAD_REQUEST;
      }
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
