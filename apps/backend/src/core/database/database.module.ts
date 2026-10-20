import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * DatabaseModule — Provee PrismaService a toda la aplicación.
 * Importado y re-exportado desde CoreModule (@Global).
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
