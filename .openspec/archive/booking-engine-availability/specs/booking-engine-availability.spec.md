# Especificación Delta: Motor de Disponibilidad y Reservas

## 1. Reglas de Negocio

### RN-1: Generación Dinámica de Slots
- Los slots no existen en base de datos. Se calculan en memoria para una fecha dada (YYYY-MM-DD).
- El rango diario de generación está delimitado por `openingHour` y `closingHour` del club.
- La duración de cada franja para una pista es su `defaultSlotMinutes` (ej: 90 minutos para pádel, 60 para tenis).

### RN-2: Determinación de Estado del Slot
Para cada pista y franja `[startTime, endTime)`:
1. Si intersecta con un `FacilityBlock` activo: status `BLOCKED` (con el motivo `title` o `reason`).
2. Si intersecta con una reserva `Booking` con estado distinto de `CANCELLED`: status `OCCUPIED`.
3. En cualquier otro caso: status `AVAILABLE`.

### RN-3: Tarificación Dinámica del Slot
- El precio base se calcula buscando la regla `PricingRule` más aplicable:
  - Coincidencia de `facilityId` o específica del `sportType` o general.
  - Coincidencia de día de la semana (`daysOfWeek`).
  - Coincidencia horaria (`startTime` a `endTime`).
  - Ordenada por mayor `priority`.
- Si no existe regla explícita, se usa un precio base por defecto configurado.
- Si el usuario es miembro registrado del club, se aplica `memberPrice`; en caso contrario `guestPrice`.
- Si la pista tiene iluminación (`hasLighting`) y el usuario la solicita, se suma `lightSurcharge`.

### RN-4: Transaccionalidad y Concurrencia al Reservar
- La creación de la reserva (`POST /bookings`) debe ejecutarse en una transacción atómica.
- Se debe consultar si existe alguna reserva `CONFIRMED` o `PENDING_CONFIRMATION` en la misma pista con solapamiento:
  `existing.startTime < new.endTime AND existing.endTime > new.startTime`.
- Si existe solapamiento, la transacción aborta inmediatamente con `409 Conflict`.
- Se genera automáticamente el pago con estado `PENDING` asociado a la reserva (Modalidad A).

---

## 2. Casos de Uso

### CU-1: Consultar disponibilidad diaria
- **Actor:** Jugador / Socio.
- **Flujo:**
  1. El cliente solicita `GET /api/v1/facilities/availability?date=2026-10-25&sportType=PADEL`.
  2. El servidor valida la fecha y extrae el club del token/cabecera.
  3. Devuelve la lista de pistas con sus respectivos slots y precios.

### CU-2: Confirmar una reserva
- **Actor:** Jugador / Socio.
- **Flujo:**
  1. El cliente envía `POST /api/v1/bookings` con `{ facilityId, startTime, endTime, lightIncluded }`.
  2. El servidor valida disponibilidad bajo transacción.
  3. Inserta el registro `Booking` y `Payment(PENDING)`.
  4. Devuelve `201 Created` con el detalle de la reserva.

### CU-3: Cancelar una reserva
- **Actor:** Jugador que organizó la reserva.
- **Flujo:**
  1. El cliente envía `DELETE /api/v1/bookings/:id`.
  2. El servidor verifica que la reserva pertenezca al usuario y al club.
  3. Actualiza el estado a `CANCELLED`.
  4. Devuelve `200 OK` con la reserva cancelada.
