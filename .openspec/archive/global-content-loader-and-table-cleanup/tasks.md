# Tareas: global-content-loader-and-table-cleanup

## Fase 1: Infraestructura de Carga Centralizada (@core)
- [x] TASK-01: Crear `LoadingService` en `apps/frontend/projects/spt-app/src/app/core/services/loading.service.ts` con tests unitarios.
- [x] TASK-02: Crear `loadingInterceptor` en `apps/frontend/projects/spt-app/src/app/core/interceptors/loading.interceptor.ts` con soporte para `X-Skip-Loading`.
- [x] TASK-03: Exportar `LoadingService` y `loadingInterceptor` en `@core` (`index.ts`).
- [x] TASK-04: Registrar `loadingInterceptor` en `appConfig` de `spt-app`, `spt-admin`, `spt-portal` y `spt-users`.

## Fase 2: Componente Overlay en Shell (spt-app)
- [x] TASK-05: Inyectar `LoadingService` y suscribir eventos de `Router` en `app.ts`.
- [x] TASK-06: Incorporar el overlay `<div class="global-loading-overlay">` con `<p-progress-spinner>` en `app.html` y maquetar estilos en `app.scss`.
- [x] TASK-07: Importar `ProgressSpinnerModule` en `app.ts`.

## Fase 3: Retirada de Spinners Locales en Tablas
- [x] TASK-08: Retirar `[loading]="loading"` de `facilities-list.component.html` y `facility-blocks.component.html` en `spt-admin`.
- [x] TASK-09: Retirar `[loading]="loading"` de `pricing-list.component.html` y `club-members.component.html` en `spt-admin`.
- [x] TASK-10: Retirar `[loading]="loading"` de `club-settings.component.html`, `activity-logs.component.html` y `superadmin-clubs.component.html` en `spt-admin`.
- [x] TASK-11: Retirar `[loading]="loading"` de `user-activity.component.html` en `spt-portal`.

## Fase 4: Pruebas y Validación
- [x] TASK-12: Ejecutar suite de pruebas de `spt-app`, `spt-admin`, `spt-portal` y `spt-users`.
- [x] TASK-13: Verificar compilación completa con `npx ng build spt-app`.
- [x] TASK-14: Validar integridad de especificaciones OpenSpec con `npm run spec:check`.
