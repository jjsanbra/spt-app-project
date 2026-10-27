# Proposal: Alineación de Rangos de Tiempo en Vista Semana de Reservas

**Fecha:** 2026-10-27  
**Estado:** ✅ Completado
**Archivado:** 2026-10-27  
**Autor:** Antigravity AI Pair Programmer & Development Team  

---

## 1. Contexto y Motivación

En el portal de socios y jugadores (`spt-portal`), la cuadrícula de reservas (`BookingsGridComponent`) permite visualizar la disponibilidad de pistas en modalidad día (`calendarGranularity = 'day'`) y semana (`calendarGranularity = 'week'`).

* **Comportamiento en Vista Día:** La cuadrícula agrupa las pistas por deporte (`sportGridGroups`) y calcula los rangos horarios (`timeSlots`) basándose exclusivamente en los slots configurados para ese deporte y sus pistas (por ejemplo, pádel con franjas de 90 minutos: `08:00 - 09:30`, `09:30 - 11:00`, etc.).
* **Problema en Vista Semana:** La cuadrícula semanal está enfocada en una única pista activa (`activeWeekFacility`), pero las filas horarias se generaban a partir de `uniqueTimeSlots`. Este getter agregaba indiscriminadamente las franjas de **todas las instalaciones de todos los deportes del club**, provocando una mezcla caótica de duraciones heterogéneas (30 min, 60 min, 90 min) en una misma tabla (ej. `08:00 - 08:30`, `08:00 - 09:00`, `08:00 - 09:30`, etc.). Como resultado, la pista activa mostraba múltiples filas intermedias vacías e inconexas con su duración real (`defaultSlotMinutes`).
* **Incidencia secundaria detectada:** El indicador del día actual en la cabecera de la semana mostraba la clave sin traducir `PORTAL.BOOKINGS.TODAY` debido a la falta de correspondencia en el diccionario `es.json`.

---

## 2. Solución Propuesta

1. **Alineación de Rangos Horarios:** Sustituir la agregación global de `uniqueTimeSlots` en la vista semana por un cálculo específico ligado a la pista activa seleccionada (`activeWeekTimeSlots`), que respete su configuración horaria (`defaultSlotMinutes` y slots generados), garantizando la misma coherencia, cadencia y limpieza visual de la vista día.
2. **Fallback por Deporte:** En caso de que la pista activa no cuente temporalmente con slots en la fecha seleccionada, derivar las franjas horarias a partir de las pistas del mismo deporte o de la duración por defecto de la pista.
3. **Internacionalización:** Corregir el indicador del día de hoy en la cabecera semanal para consumir `COMMON.TODAY` o incorporar `PORTAL.BOOKINGS.TODAY` en `es.json`.

---

## 3. Criterios de Aceptación

- [ ] **CA-01 (Filtrado de Franjas por Pista en Semana):** Las filas horarias en la vista semana deben mostrar única y exclusivamente los rangos de tiempo correspondientes a la pista seleccionada (`activeWeekFacility`), sin mezclar duraciones ni franjas de otros deportes o pistas.
- [ ] **CA-02 (Coherencia con Vista Día):** Para una pista de pádel de 90 minutos, la vista semana debe mostrar intervalos continuos de 90 minutos (`08:00 - 09:30`, `09:30 - 11:00`, etc.), idénticos a los del grupo de pádel en la vista día.
- [ ] **CA-03 (Reactividad al Cambiar de Pista):** Al cambiar de pista en el selector de la vista semana (`selectedWeekFacilityId`), la cuadrícula debe recalcular y actualizar inmediatamente sus filas horarias según la nueva pista seleccionada.
- [ ] **CA-04 (Internacionalización del Pill 'Hoy'):** La etiqueta visual del día actual en la cabecera de la vista semanal debe traducirse correctamente al español ("Hoy") sin mostrar claves crudas.
- [ ] **CA-05 (Compatibilidad y Cobertura de Tests):** Todos los tests unitarios de `spt-portal` (59 tests) deben actualizarse o mantenerse pasando al 100%, verificando los nuevos métodos de cálculo de franjas horarias.

---

## 4. Impacto Estimado

- **Backend:** Nulo (el endpoint `GET /api/v1/facilities/availability` proporciona la información necesaria).
- **Frontend (`spt-portal` & `spt-app`):** 
  - `bookings-grid.component.ts`: Creación del getter `activeWeekTimeSlots` y refactorización del binding en la plantilla.
  - `bookings-grid.component.html`: Vinculación de `@for (timeRange of activeWeekTimeSlots; track timeRange)`.
  - `es.json`: Incorporación de `PORTAL.BOOKINGS.TODAY: "Hoy"`.
- **Base de datos:** Ninguno (cambio 100% UI/UX frontend).
- **Riesgo:** 🟢 Bajo.

---

## 5. Dependencias

- Ninguna.
