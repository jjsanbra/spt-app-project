# Tareas de Implementación: Unificación de Layout de Cabeceras de Páginas (Page Headers)

## Fase 1: Creación del Componente Central y Design System
- [x] 1.1 Crear estilos base en `apps/frontend/projects/spt-app/src/styles/components/_page-header.scss` e importarlo en `_index.scss`.
- [x] 1.2 Implementar `PageHeaderComponent` standalone en `apps/frontend/projects/spt-app/src/app/core/components/page-header/`.
- [x] 1.3 Exportar `PageHeaderComponent` en `apps/frontend/projects/spt-app/src/app/core/index.ts`.
- [x] 1.4 Crear suite de pruebas unitarias `page-header.component.spec.ts` verificando proyección de contenido, inputs, back-button y badges (>= 90% cobertura).

## Fase 2: Migración en Microfrontend spt-admin
- [x] 2.1 Refactorizar cabecera de `FacilitiesListComponent` (`facilities-list.component.html`) y eliminar estilos redundantes en `.scss`.
- [x] 2.2 Refactorizar cabecera de `FacilityBlocksComponent` (`facility-blocks.component.html`) con `backUrl`, `badgeText` y selector contextual.
- [x] 2.3 Refactorizar cabecera de `PricingListComponent` (`pricing-list.component.html`).
- [x] 2.4 Refactorizar cabecera de `ClubMembersComponent` (`club-members.component.html`).
- [x] 2.5 Refactorizar cabecera de `SuperadminClubsComponent` (`superadmin-clubs.component.html`).
- [x] 2.6 Refactorizar cabecera de `ActivityLogsComponent` (`activity-logs.component.html`) integrando `PageHeaderComponent` fuera del `p-card`.
- [x] 2.7 Ejecutar y verificar pruebas unitarias de `spt-admin`.

## Fase 3: Migración en Microfrontend spt-portal
- [x] 3.1 Refactorizar cabecera de `BookingsGridComponent` (`bookings-grid.component.html`) y conservar su barra de granularidad.
- [x] 3.2 Refactorizar cabecera de `MyBookingsComponent` (`my-bookings.component.html`).
- [x] 3.3 Refactorizar cabecera de `OpenMatchesComponent` (`open-matches.component.html`).
- [x] 3.4 Refactorizar cabecera de `UserActivityComponent` (`user-activity.component.html`).
- [x] 3.5 Ejecutar y verificar pruebas unitarias de `spt-portal`.

## Fase 4: Validación de Calidad y Regresión
- [x] 4.1 Verificar linter en todo el monorepositorio (`npm run lint`).
- [x] 4.2 Ejecutar pruebas unitarias globales con reporte de cobertura diff (`npm run test` / `check-coverage-diff.js`).
- [x] 4.3 Validar coherencia visual responsive en resoluciones móvil (`<= 640px`), tablet y desktop.
