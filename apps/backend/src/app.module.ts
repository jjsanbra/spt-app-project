import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';

/**
 * AppModule — Módulo raíz de la aplicación SPT Backend.
 *
 * Estructura de módulos:
 * - CoreModule: DatabaseModule (Prisma), configuración global
 * - HealthModule: Endpoint /api/health
 * - AuthModule: JWT, login, refresh (Fase 2)
 * - UsersModule: Perfil, avatar (Fase 2)
 * - ClubsModule: Gestión de tenants (Fase 3)
 * - FacilitiesModule: Instalaciones, bloqueos (Fase 3)
 * - PricingModule: Motor de precios (Fase 3)
 * - BookingsModule: Motor de reservas (Fase 4-5)
 * - NotificationsModule: Email, WS, SMS (Fase 6)
 * - SuperadminModule: Panel global (Fase 7)
 */
@Module({
  imports: [
    // ─── Configuración global ───────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // ─── Rate Limiting ──────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // ─── Tareas programadas (cron jobs) ────────────────────
    ScheduleModule.forRoot(),

    // ─── Módulos de infraestructura ─────────────────────────
    CoreModule,
    HealthModule,

    // ─── Módulos de negocio (se añaden por fases) ──────────
    // AuthModule,      <- Fase 2
    // UsersModule,     <- Fase 2
    // ClubsModule,     <- Fase 3
    // FacilitiesModule,<- Fase 3
    // PricingModule,   <- Fase 3
    // BookingsModule,  <- Fase 4
    // NotificationsModule, <- Fase 6
    // SuperadminModule,    <- Fase 7
  ],
})
export class AppModule {}
