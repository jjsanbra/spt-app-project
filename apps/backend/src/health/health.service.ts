import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

/**
 * HealthService — Verifica el estado de los servicios críticos.
 */
@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const dbStatus = await this.checkDatabase();

    return {
      status: dbStatus ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env['npm_package_version'] ?? '0.1.0',
      environment: process.env['NODE_ENV'] ?? 'development',
      services: {
        database: dbStatus ? 'up' : 'down',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
