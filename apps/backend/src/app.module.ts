import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { PricingModule } from './pricing/pricing.module';
import { ClubsModule } from './clubs/clubs.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SuperAdminModule } from './superadmin/superadmin.module';

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
    FacilitiesModule,
    PricingModule,
    ClubsModule,
    BookingsModule,
    NotificationsModule,
    SuperAdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
