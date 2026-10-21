# Tareas: Hardening y Seguridad para Producción (`production-hardening`)

## Fase 1: Filtros e Interceptores Core (`apps/backend`)
- [x] 1.1 Crear `AllExceptionsFilter` en `apps/backend/src/core/filters/all-exceptions.filter.ts`
- [x] 1.2 Crear `LoggingInterceptor` en `apps/backend/src/core/interceptors/logging.interceptor.ts`
- [x] 1.3 Exportar y registrar el filtro e interceptor globalmente en `apps/backend/src/main.ts`

## Fase 2: Rate Limiting y Protección contra Fuerza Bruta
- [x] 2.1 Registrar `ThrottlerGuard` como `APP_GUARD` en `AppModule`
- [x] 2.2 Aplicar decorador `@Throttle({ default: { limit: 5, ttl: 60000 } })` en endpoints críticos de `AuthController` (`/login`, `/register`)
- [x] 2.3 Escribir pruebas unitarias para `AllExceptionsFilter` y `LoggingInterceptor`

## Fase 3: Pruebas y Validación Integral
- [x] 3.1 Ejecutar suite completa de tests de backend (`npm run test:backend`)
- [x] 3.2 Ejecutar suite completa de tests de frontend (`npm run test:frontend`)
- [x] 3.3 Sincronizar grafo de arquitectura con `npm run codegraph:sync`
- [x] 3.4 Verificar compilación global de producción (`npm run build:all`)
