import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { BusinessException } from './business.exception';
import { ErrorCode } from './error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: number = ErrorCode.UNKNOWN;
    let message = '服务器内部错误';
    let detail: string | undefined;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
      detail = exception.detail;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as Record<string, unknown>).message?.toString() ??
            exception.message;
      // NestJS ValidationPipe 的校验错误会返回数组格式的 message
      const resObj = res as Record<string, unknown>;
      if (Array.isArray(resObj.message)) {
        message = resObj.message.join('; ');
        code = ErrorCode.VALIDATION_FAILED;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unknown exception thrown', exception);
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${message}`,
      );
    }

    response.status(status).json({
      code,
      message,
      ...(detail && { detail }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
