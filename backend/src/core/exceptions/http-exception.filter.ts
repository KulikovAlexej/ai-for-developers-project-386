import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let body: Record<string, unknown>;

    if (status === 404) {
      body = { code: 'NOT_FOUND', message: exception.message };
    } else if (status === 409) {
      body = { code: 'CONFLICT', message: exception.message };
    } else if (status === 400) {
      const resp = exceptionResponse as Record<string, unknown>;
      const messages = resp.message;
      body = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: Array.isArray(messages)
          ? messages
          : [messages ?? 'Bad request'],
      };
    } else {
      body = { code: 'ERROR', message: exception.message };
    }

    response.status(status).json(body);
  }
}
