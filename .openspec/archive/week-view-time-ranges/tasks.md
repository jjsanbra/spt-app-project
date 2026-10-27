# Tasks: Alineación de Rangos de Tiempo en Vista Semana de Reservas

**Fecha:** 2026-10-27  
**Estado:** 🟡 En Validación  

---

## Fase 1: Internacionalización y Diccionarios

- [x] I18N-01: Añadir clave `PORTAL.BOOKINGS.TODAY` con valor `"Hoy"` en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
- [x] I18N-02: Homologar uso de la clave en la plantilla `bookings-grid.component.html`.

## Fase 2: Lógica de Cuadrícula en Frontend (`spt-portal`)

- [x] FRONT-01: Implementar el getter `activeWeekTimeSlots` en `bookings-grid.component.ts` que filtre y calcule los slots de la pista activa seleccionada (`activeWeekFacility`) con fallback a su grupo de deporte.
- [x] FRONT-02: Actualizar la tabla de la vista semana en `bookings-grid.component.html` para iterar sobre `activeWeekTimeSlots` en lugar de `uniqueTimeSlots`.
- [x] FRONT-03: Verificar la correcta reactividad del componente ante cambios en el selector de pista (`selectedWeekFacilityId`).

## Fase 3: Pruebas Unitarias y Verificación

- [x] TEST-01: Ampliar pruebas unitarias en `bookings-grid.component.spec.ts` para cubrir el getter `activeWeekTimeSlots` con pistas de distintas duraciones (60 min vs 90 min) y validar que no se mezclen slots.
- [x] TEST-02: Ejecutar suite completa de tests de `spt-portal` (62 tests) asegurando 100% de éxito.
- [x] TEST-03: Comprobar visualmente la vista semana con Playwright para certificar la desaparición de filas intermedias parásitas y la correcta visualización del pill "Hoy".

## Fase 4: Documentación y Cierre OpenSpec

- [x] DOC-01: Archivar cambio con `node scripts/spec-archive.js week-view-time-ranges` cuando el usuario solicite commit.
