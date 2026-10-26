# Tasks: system-activity-audit-logs

**Fecha:** 2026-10-26
**Estado:** 🟢 Implementado (Listo para revisión y commit)

---

## Fase 1: Modelo de Datos y Migración Prisma
- [x] 1.1 Agregar enum `ActivityAction` y modelo `ActivityLog` en `apps/backend/prisma/schema.prisma`.
- [x] 1.2 Añadir relaciones correspondientes en `Club` y `User`.
- [x] 1.3 Generar y aplicar migración en PostgreSQL (`npx prisma migrate dev --name add_activity_logs`).
- [x] 1.4 Regenerar cliente Prisma (`npx prisma generate`).

## Fase 2: Backend — Módulo de Logs de Actividad
- [x] 2.1 Crear `ActivityLogsModule`, `ActivityLogsService` y `ActivityLogsController` en `apps/backend/src/activity-logs/`.
- [x] 2.2 Definir DTOs OpenAPI (`QueryActivityLogsDto`, `ActivityLogItemDto`, `ActivityLogsPaginatedResponseDto`).
- [x] 2.3 Implementar método `log()` asíncrono y resiliente en `ActivityLogsService`.
- [x] 2.4 Implementar endpoint de consulta paginada para club `GET /api/v1/clubs/:clubId/activity-logs` con RBAC (`OWNER`, `ADMIN`, `SUPER_ADMIN`).
- [x] 2.5 Implementar endpoint de consulta propia para usuarios `GET /api/v1/users/me/activity-logs` restringido a `userId = req.user.id`.
- [x] 2.6 Implementar endpoint de consulta global para SuperAdmin `GET /api/v1/superadmin/activity-logs`.
- [x] 2.7 Crear tests unitarios exhaustivos para `ActivityLogsService` y `ActivityLogsController`.

## Fase 3: Instrumentación de Eventos en Servicios Clave
- [x] 3.1 Integrar llamadas de log en `BookingsService` (creación, cancelación con motivo, completado).
- [x] 3.2 Integrar llamadas de log en `FacilitiesService` (alta de pistas, edición, creación y borrado de bloqueos).
- [x] 3.3 Integrar llamadas de log en `PricingService` (creación, edición y borrado de reglas tarifarias).
- [x] 3.4 Integrar llamadas de log en `ClubsMembersService` (cambios de rol, recargas y ajustes de monedero).
- [x] 3.5 Integrar llamadas de log en `AuthService` (logins y cambios de contraseña).
- [x] 3.6 Actualizar tests unitarios existentes en backend verificando que los mocks de `ActivityLogsService` funcionen correctamente.

## Fase 4: Sincronización de Contratos Frontend (Orval y @core)
- [x] 4.1 Ejecutar `npm run api:generate` para generar clientes tipados y DTOs desde OpenAPI.
- [x] 4.2 Exportar nuevos DTOs y servicios desde `@core` en `libs/core`.

## Fase 5: Frontend — Vista de Auditoría en `spt-admin`
- [x] 5.1 Agregar traducciones de auditoría en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
- [x] 5.2 Añadir elemento de navegación en el menú lateral para roles autorizados (`ADMIN`, `OWNER`, `SUPER_ADMIN`).
- [x] 5.3 Crear componente standalone `ActivityLogsComponent` en `apps/frontend/projects/spt-admin/src/app/pages/activity-logs/`.
- [x] 5.4 Diseñar interfaz con PrimeNG: `p-table` lazy, filtros con `p-select`, `p-datepicker` y `p-inputtext`.
- [x] 5.5 Implementar modal de inspección detallada con `p-dialog` y visualizador estructurado de cambios.
- [x] 5.6 Implementar botón y lógica de exportación a archivo CSV.
- [x] 5.7 Crear pruebas unitarias con generadores de mocks de Orval para `ActivityLogsComponent` (cobertura >= 80%).

## Fase 6: Frontend — Vista "Mi Actividad" en `spt-portal`
- [x] 6.1 Añadir rutas y navegación en `spt-portal` hacia `/portal/activity`.
- [x] 6.2 Crear componente standalone `UserActivityComponent` en `apps/frontend/projects/spt-portal/src/app/pages/activity/`.
- [x] 6.3 Diseñar interfaz amigable para socios con lista/timeline de movimientos personales.
- [x] 6.4 Crear pruebas unitarias con generadores de mocks de Orval para `UserActivityComponent` (cobertura >= 80%).

## Fase 7: Validación Final, Documentación y Archivado
- [x] 7.1 Ejecutar `npm run test` (backend y frontend) verificando 100% de tests pasando.
- [x] 7.2 Ejecutar `npm run build:all` y `npm run build:backend`.
- [x] 7.3 Ejecutar `npm run spec:check` para verificar integridad OpenSpec.
- [x] 7.4 Archivar cambio con `node scripts/spec-archive.js system-activity-audit-logs`.
