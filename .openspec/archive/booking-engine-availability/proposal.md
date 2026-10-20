# Propuesta: Motor de Disponibilidad y Reservas (`booking-engine-availability`)

## Contexto de Negocio
El núcleo de valor de una plataforma SaaS para centros deportivos (`spt-app-project`) es el motor de reservas: permitir a los jugadores consultar en tiempo real qué pistas están libres para una fecha y deporte determinados, ver sus precios y reservar de forma inmediata y fiable.

Actualmente contamos con pistas (`Facility`), bloqueos de pistas (`FacilityBlock`), reglas de precios punta/valle (`PricingRule`) y configuración del horario del club (`openingHour`, `closingHour`, `slotDurationMinutes`, `paymentMode`). Sin embargo, no disponemos de:
1. Un motor de cálculo dinámico de franjas horarias (slots) en memoria que evalúe la disponibilidad real de cada pista sin persistir slots estáticos en BBDD.
2. Un endpoint transaccional seguro contra condiciones de carrera (race conditions / solapamientos simultáneos) para confirmar reservas completas (`POST /bookings`).
3. La interfaz de usuario en el microfrontend del jugador (`spt-portal`) con:
   - Vista de búsqueda y selección de fecha / deporte.
   - Matriz visual interactiva de disponibilidad por pistas y horas.
   - Diálogo modal de confirmación con desglose de precio, iluminación y política de pago (Modalidad A: presencial en centro).
   - Vista de "Mis Reservas" con estado y opción de cancelación.

## Solución Propuesta

### 1. Backend (`apps/backend`)
- **Módulo `BookingsModule`**:
  - `GET /api/v1/facilities/availability?date=YYYY-MM-DD&sportType=...`:
    - Consulta las pistas activas del club, sus bloqueos (`FacilityBlock`) y reservas confirmadas (`Booking`) en la fecha solicitada.
    - Genera dinámicamente las franjas horarias desde `openingHour` hasta `closingHour` con el intervalo de cada pista (`defaultSlotMinutes`).
    - Cruza cada franja con las reglas de tarificación aplicables (`PricingRule`) según el día de la semana, hora e instalación para devolver el precio calculado (`price`, `isPeakHour`, `lightSurcharge`).
    - Marca cada slot como `AVAILABLE`, `OCCUPIED` (reserva existente) o `BLOCKED` (mantenimiento/torneo).
  - `POST /api/v1/bookings`:
    - Valida que la franja solicitada no se solape con ninguna reserva existente ni bloqueo activo.
    - Ejecuta la creación dentro de una **transacción Prisma / PostgreSQL** con verificación de concurrencia.
    - Asocia el precio calculado y genera el registro en `payments` con estado `PENDING` (Modalidad A).
  - `GET /api/v1/bookings/my`:
    - Devuelve las reservas del usuario autenticado ordenadas por fecha/hora.
  - `DELETE /api/v1/bookings/:id`:
    - Permite al usuario cancelar su reserva (marcando status `CANCELLED` y liberando la pista).

### 2. Frontend (`apps/frontend/projects/spt-portal`)
- **Página de Disponibilidad y Reserva (`BookingsGridComponent`)**:
  - Selector de fecha (hoy, mañana, calendario) y filtro por deporte (Pádel, Tenis, etc.).
  - Grid de slots visuales: franjas libres con precio destacado, ocupadas en gris y bloqueadas con motivo.
  - Modal interactiva para confirmar la reserva con directivas PrimeNG (`pButton`, `pDialog`, `pTag`).
  - Integración obligatoria con `NotificationService` y `ConfirmDialogService` de `@core`.
- **Página de "Mis Reservas" (`MyBookingsComponent`)**:
  - Listado de reservas activas e históricas del usuario con tarjeta resumen y botón de cancelación con diálogo centralizado.

## Criterios de Aceptación (CA)
- **CA-1: Prevención de Solapamiento:** Dos usuarios no pueden reservar la misma pista en la misma franja horaria. El backend debe rechazar con `409 Conflict` cualquier intento de solapamiento.
- **CA-2: Respeto de Horarios y Bloqueos:** No se pueden reservar slots fuera del horario del club ni durante franjas con `FacilityBlock`.
- **CA-3: Cálculo Preciso de Precios:** El precio debe coincidir con la `PricingRule` más prioritaria para el día de la semana y hora solicitados.
- **CA-4: Consumo Tipado OpenAPI:** El cliente Angular consumirá los modelos generados por Orval en `@core`.
- **CA-5: Experiencia UI Premium y Reglas `AGENTS.md`:** Sin botones nativos (uso de `pButton`), diseño adaptable a móvil (`@include mobile`), cero texto hardcodeado (100% `ngx-translate`).
