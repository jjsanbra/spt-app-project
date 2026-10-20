import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService — Wrapper de PrismaClient para NestJS.
 *
 * Gestiona el ciclo de vida de la conexión a PostgreSQL:
 * - Se conecta al iniciar el módulo
 * - Se desconecta al destruir el módulo (graceful shutdown)
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
        // Descomenta en desarrollo para ver las queries SQL:
        // { emit: 'stdout', level: 'query' },
        // { emit: 'stdout', level: 'info' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Conexión a PostgreSQL establecida');
    } catch (error) {
      this.logger.error('❌ Error conectando a PostgreSQL', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('🔌 Conexión a PostgreSQL cerrada');
  }
}
