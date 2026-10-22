# Tasks: bookings-calendar-grid-refactor

**Fecha:** 2026-10-22  
**Estado:** ✅ Completado  

---

## Fase 1: Claves de Internacionalización y Tipos
- [x] **TASK-01**: Añadir claves de internacionalización faltantes en [es.json](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/assets/i18n/es.json):
  - `COMMON.TODAY`, `COMMON.TOMORROW`.
  - `PORTAL.BOOKINGS.VIEW_GRID`, `PORTAL.BOOKINGS.VIEW_CARDS`, `PORTAL.BOOKINGS.DATE_PICKER_LABEL`, `PORTAL.BOOKINGS.TIMELINE_HEADER`.

## Fase 2: Componente BookingsGrid (DatePicker y Lógica de Matriz Horaria)
- [x] **TASK-02**: En [bookings-grid.component.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-portal/src/app/pages/bookings/bookings-grid.component.ts):
  - Importar `DatePickerModule` de `primeng/datepicker`.
  - Importar `SelectButtonModule` para alternar modos de vista.
  - Gestionar `selectedCalendarDate: Date` y la sincronización con `selectedDate: string` (`YYYY-MM-DD`).
  - Añadir cálculo de la matriz horaria (`uniqueTimeSlots` y `getSlotForFacilityAndTime(facility, timeRange)`).
  - Añadir soporte para alternar entre vista `grid` (cuadrante calendario) y vista `cards` (tarjetas).

## Fase 3: Plantilla HTML y Estilos SCSS con PrimeNG
- [x] **TASK-03**: En [bookings-grid.component.html](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-portal/src/app/pages/bookings/bookings-grid.component.html):
  - Reemplazar `<input type="date">` por `<p-datepicker>`.
  - Aplicar `pButton` y traducciones en botones de "Hoy" y "Mañana".
  - Implementar la vista matriz de calendario (`.calendar-matrix-wrapper`) con cabeceras de pistas en columnas y franjas horarias en filas.
  - Asegurar que todas las celdas de slots utilicen la directiva `pButton`.
- [x] **TASK-04**: En [bookings-grid.component.scss](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-portal/src/app/pages/bookings/bookings-grid.component.scss):
  - Definir estilos modernos con scroll horizontal sticky para la matriz de pistas.
  - Respetar los tokens de diseño Stitch y mixins responsivos (`@include mobile`, `@include tablet`).

## Fase 4: Pruebas Unitarias y Validación
- [x] **TASK-05**: Actualizar [bookings-grid.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-portal/src/app/pages/bookings/bookings-grid.component.spec.ts).
- [x] **TASK-06**: Ejecutar suite de tests (`npm test`).
- [x] **TASK-07**: Ejecutar `npm run build:all` y verificar 0 errores.
- [x] **TASK-08**: Validar especificaciones con `node scripts/validate-specs.js`.
