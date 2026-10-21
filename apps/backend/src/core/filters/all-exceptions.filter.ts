import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

export interface ErrorResponsePayload {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * AllExceptionsFilter — Filtro canónico global para captura y estandarización de errores.
 * Garantiza respuestas JSON uniformes y oculta trazas de servidor en producción.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService?: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, any>;
        message = body['message'] || exception.message;
        error = body['error'] || exception.name;
      }
    } else if (exception instanceof Error) {
      const isProduction =
        (this.configService?.get<string>('NODE_ENV') ?? process.env['NODE_ENV']) === 'production';

      if (!isProduction) {
        message = exception.message;
        error = exception.name || 'Internal Server Error';
      }

      this.logger.error(
        `[${request.method}] ${request.url} - Error no controlado: ${exception.message}`,
        exception.stack,
      );
    }

    const payload: ErrorResponsePayload = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(payload);
  }
}
