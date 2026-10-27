# Tasks: Rediseño del Layout del Header de Reservas

**Fecha:** 2026-10-27  
**Estado:** 🟡 En Progreso  

---

## Fase 1: Internacionalización y Métodos de Navegación Diaria

- [x] I18N-01: Añadir y verificar claves de traducción para navegación día anterior/siguiente (`PORTAL.BOOKINGS.PREV_DAY`, `PORTAL.BOOKINGS.NEXT_DAY`) y títulos accesibles en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
- [x] LOGIC-01: Implementar en `bookings-grid.component.ts` los métodos `prevDay()` y `nextDay()` para permitir navegación paso a paso con flechas en la vista diaria, respetando `minDate`.
- [x] LOGIC-02: Garantizar que la etiqueta del mes en vista mensual utilice la localización en español (`Octubre 2026`).

## Fase 2: Reestructuración de Plantilla HTML (`bookings-grid.component.html`)

- [x] HTML-01: Reestructurar el contenedor `.filter-controls-card` en dos niveles: `.header-context-row` (Fila 1) y `.header-nav-row` (Fila 2).
- [x] HTML-02: En Fila 1, alinear a la izquierda el `p-selectbutton` de granularidad y a la derecha los filtros contextuales (`Deporte` / `Pista`) y el toggle de vista (`Cuadrante` / `Pistas`).
- [x] HTML-03: En Fila 2, unificar la barra de navegación temporal para Día, Semana y Mes con los controles de paso `[ < ] [ Actual ] [ > ]` a la izquierda y el selector interactivo de fecha a la derecha.

## Fase 3: Estilos SCSS con Tokens del Sistema de Diseño (`bookings-grid.component.scss`)

- [x] STYLE-01: Aplicar tokens semánticos de espaciado (`--spacing-*`), radios (`--radius-*`) y superficies (`--surface-*`) en las dos filas del header.
- [x] STYLE-02: Estilizar `p-selectbutton` como *segmented control* moderno y limpio para granularidad y modo de vista, eliminando textos pegados.
- [x] STYLE-03: Reemplazar los estilos forzados con `!important` en botones de navegación por directivas PrimeNG nativas (`[rounded]="true"` y `severity="secondary"`).
- [x] STYLE-04: Implementar adaptación fluida para móvil y tablet mediante `@include mobile` y `@include tablet`.

## Fase 4: Pruebas Unitarias, Validación Visual y Cierre

- [x] TEST-01: Actualizar y verificar las pruebas unitarias en `bookings-grid.component.spec.ts` para cubrir `prevDay()`, `nextDay()` y la reactividad del header.
- [x] TEST-02: Ejecutar suite de pruebas de `spt-portal` garantizando 100% de éxito.
- [x] TEST-03: Validar visualmente en Playwright los 3 casos (Día, Semana y Mes) y capturar evidencias gráficas.
- [x] ARCH-01: Archivar cambio con `node scripts/spec-archive.js bookings-header-layout-redesign` cuando el usuario solicite commit.
