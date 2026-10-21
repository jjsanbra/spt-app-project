import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * LoggingInterceptor — Registra la trazabilidad y latencia de cada petición HTTP.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl } = req;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const statusCode = err.status || 500;
          this.logger.warn(`${method} ${originalUrl} ${statusCode} - ${duration}ms [FAILED]`);
        },
      }),
    );
  }
}
