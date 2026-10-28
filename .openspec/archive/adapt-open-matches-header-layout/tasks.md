# Tareas: Adaptación del Header y Barra de Filtros de Partidas Abiertas (`open-matches`)

## Fase 1: Componente TypeScript (`open-matches.component.ts`)
- [x] 1.1 Importar `DatePickerModule` desde `'primeng/datepicker'`.
- [x] 1.2 Definir `selectedCalendarDate: Date = new Date();` y `minDate: Date = new Date();` (inicializada a las 00:00).
- [x] 1.3 Implementar métodos de navegación: `setToday()`, `setTomorrow()`, `prevDay()`, `nextDay()`, `isPrevDayDisabled()`, `isTodaySelected()`, `isTomorrowSelected()`, `onDatePickerChange(date: Date | null)`.

## Fase 2: Plantilla HTML (`open-matches.component.html`)
- [x] 2.1 Sustituir `.filter-bar-card` por `.filter-controls-card`.
- [x] 2.2 Maquetar la fila de controles con contenedor flex para navegación temporal a la izquierda y selector de deporte a la derecha.
- [x] 2.3 Implementar botones con directiva `pButton` (`.nav-arrow-btn`, `.nav-quick-btn` con `[class.is-selected]`).
- [x] 2.4 Integrar `p-datepicker` con inputs semánticos (`size="small"`, `dateFormat="dd/mm/yy"`, `[appendTo]="'body'"`).
- [x] 2.5 Refactorizar `p-select` de deporte a `size="small"` e integración con el layout.

## Fase 3: Estilos SCSS y Responsividad (`open-matches.component.scss`)
- [x] 3.1 Adoptar clases `.filter-controls-card`, `.header-nav-row`, `.nav-step-group`, `.nav-date-group`, `.nav-arrow-btn`, `.nav-quick-btn`, `.compact-datepicker`, `.sport-filter-wrapper`.
- [x] 3.2 Aplicar mixin responsivo `@include mobile-or-tablet` para transicionar de flex horizontal a columna limpia.
- [x] 3.3 Utilizar exclusivamente variables del sistema de diseño (sin colores ni tamaños hardcodeados).

## Fase 4: Verificación y Tests Unitarios
- [x] 4.1 Actualizar o extender `open-matches.component.spec.ts` para cubrir los nuevos métodos de navegación temporal.
- [x] 4.2 Ejecutar `npm run test:frontend` y asegurar 100% de éxito.
