# Tasks: Mejoras de Shell (Sidebar PrimeNG, Notificaciones y Persistencia)

**Fecha:** 2026-10-27  
**Estado:** 🟡 En Progreso  

---

## Fase 1: Lógica y Plantilla en `spt-app` (Ocultación Mis Partidos)

- [x] APP-01: Declarar el signal computado `canViewMatches` en `apps/frontend/projects/spt-app/src/app/app.ts`.
- [x] APP-02: Condicionar el enlace `<a>` a `/portal/matches` con `@if (canViewMatches())` en `apps/frontend/projects/spt-app/src/app/app.html`.

## Fase 2: Corrección de Dependencia Circular y Persistencia en Recargas

- [x] AUTH-01: Refactorizar `authInterceptor` desacoplando la inyección sincrónica de `AuthService` mediante `Injector` lazy y lectura directa de tokens desde `localStorage`.
- [x] AUTH-02: Diferir `initSession()` en el constructor de `AuthService` con `queueMicrotask` y restringir limpieza de sesión a 401/403.
- [x] AUTH-03: Validar empíricamente con Playwright que la recarga (F5) en `/admin` y `/admin/pricing` preserva la sesión y la ruta sin redirigir al login.

## Fase 3: Homologación del Sidebar a PrimeNG Oficial (`SidebarModule`)

- [x] SIDE-01: Consultar ejemplos canónicos de `sidebar` en la documentación oficial (`https://primeng.dev/sidebar`) y `@primeng/mcp`.
- [x] SIDE-02: Importar `SidebarModule` en `App` y reemplazar `p-drawer` por la arquitectura oficial `p-sidebar-layout`, `p-sidebar`, `p-sidebar-aside`, `p-sidebar-panel`, `p-sidebar-header`, `p-sidebar-content`, `p-sidebar-footer` y `p-sidebar-main`.
- [x] SIDE-03: Eliminar hacks de CSS redundantes en `app.scss`, limitando la personalización a tokens de color (`--surface-sidebar`, `--border-subtle`).

## Fase 4: Homologación y Simplificación de Estilos de Badge y Notificaciones

- [x] NOTIF-01: Consultar el ejemplo oficial de Badge en botones de PrimeNG (`https://primeng.dev/button#badge`).
- [x] NOTIF-02: Simplificar `notification-bell.component.html` adoptando el patrón canónico con `<p-overlay-badge>` sobre el botón `pButton` sin sobrecargas manuales de clases.
- [x] NOTIF-03: Limpiar estilos manuales de posicionamiento, padding y dimensiones en `_badges.scss` y `notification-bell.component.scss`, manteniendo exclusivamente los tokens de color semánticos de PrimeNG Badge.

## Fase 5: Pruebas Unitarias, Validación y Cierre

- [x] TEST-01: Actualizar y ejecutar suite completa de pruebas unitarias (`spt-app`: 57/57 tests pasando, total frontend: 232/232 tests pasando).
- [x] ARCH-01: Archivar cambio con `node scripts/spec-archive.js hide-matches-link-for-admins` al preparar commit.


