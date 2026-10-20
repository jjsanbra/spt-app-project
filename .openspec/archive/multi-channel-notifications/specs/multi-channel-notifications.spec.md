# Delta de Especificación Funcional: Notificaciones Multi-canal (`multi-channel-notifications`)

## 1. Reglas de Negocio

### RN-1: Creación y Emisión de Notificaciones
- Toda notificación generada por el sistema:
  - Se persiste en la tabla `notifications` asociada a un `userId`.
  - Si el usuario tiene una conexión WebSocket activa, se le transmite inmediatamente por el evento `notification:new`.
  - Si el tipo de notificación requiere email (ej. `BOOKING_CONFIRMED`), se envía un correo transaccional asíncrono.

### RN-2: Disparadores de Notificación en Reservas
1. **Reserva Completa (`BOOKING_CONFIRMED`):**
   - Destinatario: Usuario que realiza la reserva.
   - Contenido: Detalle de pista, día, hora y precio.
2. **Inscripción en Partida Abierta (`OPEN_GAME_JOINED`):**
   - Destinatario: Anfitrión de la partida y otros participantes ya inscritos.
   - Contenido: Nombre del nuevo jugador que se ha unido a la pista.
3. **Partida Abierta Completa (`OPEN_GAME_COMPLETE`):**
   - Destinatarios: Todos los participantes de la partida.
   - Contenido: Aviso de que todas las plazas se han cubierto y el partido está listo.
4. **Cancelación de Reserva (`BOOKING_CANCELLED`):**
   - Destinatario: Usuario que cancela (o participantes si se cancela la partida completa).
   - Contenido: Confirmación de liberación de pista.

### RN-3: Gestión de Lectura
- Cada notificación tiene el flag booleano `isRead` (por defecto `false`).
- El usuario puede marcar una notificación individual como leída (`PATCH /notifications/:id/read`).
- El usuario puede marcar todas sus notificaciones como leídas simultáneamente (`PATCH /notifications/read-all`).

---

## 2. Casos de Uso UI (Shell Host)

### CU-1: Visualizar Campana y Badge
- Cuando el usuario inicia sesión en cualquier microfrontend, el Shell consulta las notificaciones no leídas.
- Si hay notificaciones sin leer, el icono de campana muestra un badge numérico rojo. Si no hay ninguna, el badge no se muestra.

### CU-2: Desplegar Bandeja de Notificaciones
- Al hacer clic en la campana, se abre un overlay panel con las últimas notificaciones ordenadas de más reciente a más antigua.
- Las no leídas muestran un fondo sutilmente destacado y un punto de acento.
- Al pulsar en "Marcar todas como leídas", el contador pasa a cero inmediatamente.
