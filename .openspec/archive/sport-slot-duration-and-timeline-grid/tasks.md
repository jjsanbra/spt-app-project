# Tareas de Implementación: Duración por Deporte y Cuadrícula Continua

**Fecha:** 2026-10-23
**Estado:** ✅ Completado

---

## Fase 1: Estandarización de Duraciones por Deporte en Backend & Admin
- [x] 1.1 Definir constante canónica `SPORT_DEFAULT_SLOT_MINUTES` en `@core` / frontend con duraciones únicas por deporte (Pádel 90 min, Tenis/Fútbol/otros 60 min).
- [x] 1.2 Actualizar formulario de pistas en `facilities-list.component.ts` para que al seleccionar un deporte se auto-asigne el `defaultSlotMinutes` correspondiente.
- [x] 1.3 Verificar consistencia de duraciones por deporte en `apps/backend/prisma/seed.ts`.

## Fase 2: Cuadrícula Continua y Limpieza de Solapes en Portal
- [x] 2.1 Refactorizar la lógica de `uniqueTimeSlots` y renderizado en `bookings-grid.component.ts` para agrupar o estructurar la disponibilidad por deporte.
- [x] 2.2 En modo "Todos los deportes", renderizar cuadrículas armonizadas por deporte con su escala temporal limpia (evitando filas combinadas artificiales como `08:00 - 09:00` y `08:00 - 09:30` consecutivas).
- [x] 2.3 Mantener soporte para reserva en slots disponibles y slots vacíos (`onEmptySlotClick`) respetando la duración exacta de cada deporte.
- [x] 2.4 Mantener la regla de corte de 2 horas de antelación y diseño responsive mobile con columna horaria pegajosa.

## Fase 3: Pruebas Unitarias y Cobertura
- [x] 3.1 Actualizar y ampliar pruebas unitarias en `facilities-list.component.spec.ts` para la auto-asignación de duración por deporte.
- [x] 3.2 Actualizar y ampliar pruebas unitarias en `bookings-grid.component.spec.ts` para la nueva visualización y cálculo de slots por deporte (cobertura >= 80%).
- [x] 3.3 Validar que la suite completa pase con `npm test` (backend y frontend).

## Fase 4: Compilación y Validación de Especificaciones
- [x] 4.1 Validar especificaciones con `node scripts/validate-specs.js`.
- [x] 4.2 Validar compilación de todos los microfrontends con `npm run build:all`.

