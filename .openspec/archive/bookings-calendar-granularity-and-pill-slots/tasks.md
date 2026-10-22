# Tareas de Implementación: Granularidad Temporal, Slots Píldora Neón y Reserva en Vacíos

## Fase 1: Estilos de Slots Píldora Neón
- [x] 1.1 Modificar `bookings-grid.component.scss` para aplicar el estilo invertido de píldora translúcida rosa a los slots disponibles (`.matrix-slot-available`) con borde y texto en rosa neón.
- [x] 1.2 Adaptar los slots de la vista de tarjetas (`.facility-slot-btn`) para mantener coherencia visual con el estilo píldora neón.
- [x] 1.3 Estilizar las celdas vacías (`.matrix-slot-empty`) para que sean interactivas con cursor pointer y efecto hover sutil.

## Fase 2: Reserva en Slots Vacíos
- [x] 2.1 Implementar método `onEmptySlotClick(facility, timeRange)` en `bookings-grid.component.ts`.
- [x] 2.2 Calcular `startTime` y `endTime` a partir del `timeRange` y `facility.defaultSlotMinutes`, validando límites de tiempo disponible.
- [x] 2.3 Vincular el evento `(click)="onEmptySlotClick(facility, timeRange)"` en `bookings-grid.component.html`.

## Fase 3: Conmutador de Granularidad (Día / Semana / Mes)
- [x] 3.1 Añadir propiedad `calendarGranularity: 'day' | 'week' | 'month'` y opciones en `bookings-grid.component.ts`.
- [x] 3.2 Añadir selector de granularidad en la barra superior de `bookings-grid.component.html`.
- [x] 3.3 Implementar visualización y navegación de vista Semana (días de la semana en cuadrícula con horas) y vista Mes (calendario mensual).
- [x] 3.4 Añadir claves i18n en `es.json` para 'Día', 'Semana' y 'Mes'.

## Fase 4: Validación y Cobertura de Pruebas
- [x] 4.1 Actualizar y añadir pruebas unitarias en `bookings-grid.component.spec.ts` para cubrir `onEmptySlotClick` y cambios de granularidad (cobertura >= 80%).
- [x] 4.2 Validar con `npm test` y `npm run build:all`.
- [x] 4.3 Comprobar integridad de especificaciones con `node scripts/validate-specs.js`.

## Fase 5: UX Mobile, Iconos de Navegación y Bloqueo de 2 Horas
- [x] 5.1 Rediseñar el layout de controles superiores en `bookings-grid.component.html` y `.scss` con mixins `@include mobile` y `@include tablet` para una experiencia mobile limpia sin desbordamientos.
- [x] 5.2 Corregir los botones de navegación previa/siguiente en vista Semana y Mes incorporando elementos `<i class="pi pi-chevron-left/right"></i>` y clase `.nav-icon-btn` para visibilidad garantizada.
- [x] 5.3 Implementar lógica `isSlotBlockedByCutoff(dateStr, startHourText)` en `bookings-grid.component.ts` (bloqueo si fecha/hora < ahora + 2 horas).
- [x] 5.4 Reflejar el bloqueo por cutoff en la vista Día y Semana (estilos `.slot-cutoff-blocked`, deshabilitación de clicks y prevención en `selectSlot` y `onEmptySlotClick`).
- [x] 5.5 Añadir claves de internacionalización necesarias en `es.json`.
- [x] 5.6 Añadir pruebas unitarias para `isSlotBlockedByCutoff` y validar tests con `npm test` y `npm run build:all`.
