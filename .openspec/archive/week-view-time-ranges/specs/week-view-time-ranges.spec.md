# Spec: Alineación de Rangos de Tiempo en Vista Semana de Reservas

**Fecha:** 2026-10-27  
**Versión:** 0.1.0  

---

## Descripción Funcional

Esta especificación describe la homologación del cálculo de rangos de tiempo en la vista semana (`calendarGranularity = 'week'`) del cuadrante de reservas (`BookingsGridComponent`). El objetivo es que las filas horarias de la tabla semanal reflejen estrictamente la cadencia y duración de reserva de la pista seleccionada (`activeWeekFacility`), evitando la agregación indiscriminada de franjas de diferentes disciplinas deportivas.

---

## Reglas de Negocio

1. **RN-01 (Ámbito de Franja por Pista en Vista Semana):** En la vista semana, los rangos de tiempo mostrados en el eje vertical deben derivarse exclusivamente de los slots válidos de la pista activa seleccionada (`activeWeekFacility.slots`).
2. **RN-02 (Alineación con Vista Día):** La periodicidad entre franjas horarias consecutivas debe coincidir exactamente con la duración configurada para la pista (`defaultSlotMinutes`, ej. 90 minutos para Pádel: 08:00 - 09:30, 09:30 - 11:00; 60 minutos para Tenis: 08:00 - 09:00, 09:00 - 10:00).
3. **RN-03 (Fallback de Disciplina Deportiva):** Si la pista activa no contiene slots calculados en el payload, se tomarán como referencia los slots de las pistas activas del mismo deporte (`sportType`) para garantizar la renderización coherente de la cuadrícula.
4. **RN-04 (Independencia Multideporte):** Queda prohibida la presencia simultánea de franjas de 30 min, 60 min y 90 min en una misma tabla cuando la pista seleccionada sea monodisciplinar.
5. **RN-05 (Internacionalización del Indicador Temporal):** El indicador del día actual en la cabecera de la columna debe mostrar siempre el texto traducido según el idioma activo del usuario ("Hoy" en español).

---

## Casos de Uso

### CU-01: Visualización semanal de pista de pádel (90 minutos)

* **Actor:** Jugador / Socio del club deportivo.
* **Precondición:** El usuario accede a `/portal/bookings`, selecciona granularidad "Semana" y tiene seleccionada la "Pista 1 - Pádel Cristal Indoor" (duración: 90 min).
* **Flujo principal:**
  1. El sistema evalúa la pista activa y obtiene sus slots específicos.
  2. El sistema genera los rangos: `08:00 - 09:30`, `09:30 - 11:00`, `11:00 - 12:30`, etc.
  3. La tabla muestra 7 columnas para los días de la semana actual y las filas horarias de 90 min.
  4. Ninguna fila muestra intervalos de 30 o 60 minutos procedentes de pistas de squash o tenis.
* **Postcondición:** La tabla se muestra ordenada y sin filas intermedias vacías.

### CU-02: Cambio de pista activa a una disciplina de 60 minutos

* **Actor:** Jugador / Socio del club deportivo.
* **Precondición:** El usuario está en la vista semana y cambia la pista activa en el selector de pista de "Pádel 1" (90 min) a "Tenis 1" (60 min).
* **Flujo principal:**
  1. El componente detecta el cambio en `selectedWeekFacilityId`.
  2. `activeWeekFacility` cambia a la pista de tenis.
  3. `activeWeekTimeSlots` se recalcula de forma reactiva con franjas de 60 minutos: `08:00 - 09:00`, `09:00 - 10:00`, `10:00 - 11:00`, etc.
  4. La cuadrícula semanal se actualiza inmediatamente mostrando los nuevos rangos y disponibilidades.
* **Postcondición:** Las filas horarias se adaptan instantáneamente a la disciplina seleccionada.
