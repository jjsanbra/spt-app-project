# Tareas: Unificación Global de Layouts, Cabeceras y Tablas al Modelo de Instalaciones

## Fase 1: Centralización y Estilos Base en Design System (spt-app)
- [x] 1.1 Declarar clase utilitaria global `.page-container` en `apps/frontend/projects/spt-app/src/styles/utilities/_layout.scss` y registrarla en el manifiesto central con `max-width: 1400px`, `margin: 0 auto` y paddings responsivos.
- [x] 1.2 Verificar que `_tables.scss` exponga `.table-card` con el 100% de ancho y bordes estandarizados.
- [x] 1.3 Asignar margen derecho de 2xl (`var(--spacing-2xl)`) al icono de cabecera (`.header-icon`) en `_page-header.scss`.

## Fase 2: Homologación en spt-admin
- [x] 2.1 Refactorizar `club-settings.component.html` y `.ts` para reemplazar la cabecera manual `<div class="page-header">` por `<spt-page-header>` proyectando el botón de guardar en `<div actions>`.
- [x] 2.2 Homologar `activity-logs.component.html` y `.scss`: actualizar contenedor a `.admin-page-container` (1400px) y cierre explícito de `<spt-page-header>`.
- [x] 2.3 Homologar `superadmin-clubs.component.html` y `.scss`: alinear paddings y ancho máximo con `facilities-list`.
- [x] 2.4 Verificar y asegurar que todas las tablas de `spt-admin` usen el paginador estándar de 5, 10, 20, 50 filas.
- [x] 2.5 Configurar icono temático en todas las cabeceras de `spt-admin` (`facilities-list`, `facility-blocks`, `pricing-list`, `club-members`, `superadmin-clubs`, `club-settings`).

## Fase 3: Homologación en spt-portal
- [x] 3.1 Actualizar `bookings-grid.component.scss`: ampliar `.portal-page-container` de 1200px a `1400px` con paddings consistentes (`var(--spacing-xl) var(--spacing-lg)`).
- [x] 3.2 Actualizar `my-bookings.component.scss`: ampliar `.portal-page-container` de 1200px a `1400px`.
- [x] 3.3 Actualizar `open-matches.component.scss`: homogeneizar paddings de `.portal-page-container` al estándar de `facilities-list`.
- [x] 3.4 Actualizar `user-activity.component.scss`: ampliar `.portal-page-container` a `1400px` y alinear espaciado inferior de `.filters-toolbar` (`margin-bottom: var(--spacing-lg)`).
- [x] 3.5 Configurar icono temático en todas las cabeceras de `spt-portal` (`bookings-grid`, `my-bookings`, `open-matches`, `user-activity`).

## Fase 4: Homologación en spt-users
- [x] 4.1 Actualizar `profile.component.html` y `.scss`: alinear el contenedor a la escala estándar del sistema y verificar consistencia de cabecera.

## Fase 5: Validación, Pruebas y Compilación
- [x] 5.1 Ejecutar suites de pruebas unitarias de `spt-admin`, `spt-portal`, `spt-users` y `spt-app` garantizando 100% de éxito (238 tests pasando).
- [x] 5.2 Compilar bundles de producción de todos los proyectos (`npm run build:all`) comprobando ausencia de errores.
- [ ] 5.3 Presentar resumen exhaustivo al usuario y esperar aprobación para archivar OpenSpec y preparar commit.
