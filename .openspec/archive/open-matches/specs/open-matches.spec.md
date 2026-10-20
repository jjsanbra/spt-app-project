# Delta de Especificación Funcional: Partidas Abiertas (`open-matches`)

## 1. Reglas de Negocio

### RN-1: Creación de Partida Abierta
- Cuando un usuario crea una reserva con `bookingType = OPEN`:
  - Se valida la disponibilidad de la pista como en una reserva normal.
  - El precio total de la pista se divide entre el número máximo de jugadores (`maxPlayers`) configurado en la instalación (por defecto 4 en pádel, 2 o 4 en tenis).
  - El creador queda registrado como anfitrión (`isHost = true`) ocupando el `slotNumber = 1`.
  - El importe del pago del anfitrión es `individualPrice = totalPrice / maxPlayers`.

### RN-2: Inscripción en Partida Abierta
- Un usuario autenticado puede unirse a una partida abierta (`POST /bookings/:id/join`) si:
  - La partida está en estado `CONFIRMED` o `PENDING_CONFIRMATION`.
  - La fecha/hora de inicio de la partida es futura (`startTime > NOW()`).
  - El usuario no está ya inscrito como participante activo (`status != 'CANCELLED'`).
  - Quedan plazas libres (`participantes activos < maxPlayers`).
- Al unirse, se le asigna el menor `slotNumber` libre y se genera su registro `Payment` individual por `individualPrice` con estado `PENDING`.

### RN-3: Concurrencia y Aforo
- Toda comprobación de aforo e inserción debe realizarse en una transacción atómica con aislamiento de base de datos.
- Si dos usuarios intentan ocupar la última plaza simultáneamente, una transacción confirmará la plaza y la otra debe fallar de forma controlada retornando `409 Conflict` con mensaje claro de plazas agotadas.

### RN-4: Abandono de Partida
- Un participante secundario (`isHost = false`) puede abandonar la partida (`DELETE /bookings/:id/leave`) antes del inicio del partido. Su estado pasa a `CANCELLED` y su slot queda disponible.
- Si el anfitrión abandona la partida:
  - Si es el único participante, la reserva completa se cancela (`status = CANCELLED`).
  - Si hay otros participantes, el siguiente participante por orden de llegada pasa a ser el anfitrión (`isHost = true`).

---

## 2. Casos de Uso UI (Portal)

### CU-1: Explorar Partidas Abiertas
- El jugador navega a la sección de Partidas Abiertas.
- Puede filtrar por deporte (Todos, Pádel, Tenis) y por fecha.
- Cada tarjeta muestra la pista, fecha, hora, precio por plaza, cuántas plazas quedan y qué jugadores están dentro.

### CU-2: Unirse a Partida
- El jugador pulsa en "Unirme a la partida".
- Se le presenta un diálogo de confirmación con el precio exacto de su plaza.
- Al aceptar, se actualiza el estado en pantalla, se notifica el éxito mediante `NotificationService` y se le muestra como participante activo.
