import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

/**
 * AppModule — Módulo raíz de la aplicación SPT Backend.
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

    // ─── Módulos de negocio ─────────────────────────────────
    AuthModule,
    UsersModule,

    // ClubsModule,     <- Fase 3
    // FacilitiesModule,<- Fase 3
    // PricingModule,   <- Fase 3
    // BookingsModule,  <- Fase 4
    // NotificationsModule, <- Fase 6
    // SuperadminModule,    <- Fase 7
  ],
})
export class AppModule {}
