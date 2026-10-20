import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ─── Seguridad ─────────────────────────────────────────────
  app.use(helmet());
  app.getHttpAdapter().getInstance().set('etag', false);

  // ─── CORS ──────────────────────────────────────────────────
  const defaultOrigins = 'http://localhost:4200,http://localhost:4201,http://localhost:4202,http://localhost:4203';
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', defaultOrigins)
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    credentials: true,
  });

  // ─── Prefijo global de la API ──────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Versionado de la API ──────────────────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ─── Validación global ─────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true,
      transform: true,          // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Swagger (solo en no-producción) ──────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SPT App API')
      .setDescription('API para el sistema SaaS de gestión de reservas deportivas')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('clubs', 'Gestión de clubes (tenants)')
      .addTag('facilities', 'Instalaciones y pistas')
      .addTag('bookings', 'Motor de reservas')
      .addTag('pricing', 'Configuración de precios')
      .addTag('notifications', 'Notificaciones')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const fs = await import('fs');
    const path = await import('path');
    fs.writeFileSync(path.resolve(__dirname, '..', 'openapi.json'), JSON.stringify(document, null, 2));

    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);

  console.log('====================================================');
  console.log(`🚀 SPT Backend API en ejecución`);
  console.log(`📡 URL API:        http://localhost:${port}/api`);
  console.log(`📚 Documentación:  http://localhost:${port}/api-docs`);
  console.log(`🩺 Health Check:   http://localhost:${port}/api/health`);
  console.log(`🌍 Entorno:        ${nodeEnv}`);
  console.log('====================================================');
}

bootstrap();
