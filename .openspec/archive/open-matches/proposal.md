# Propuesta: Partidas Abiertas y Reserva por Plazas (`open-matches`)

## Contexto de Negocio
En los deportes de raqueta (especialmente pádel y tenis), una barrera habitual es no disponer de los 4 jugadores necesarios para cerrar una pista. La funcionalidad de **Partidas Abiertas** permite a un jugador anfitrión iniciar una reserva reservando su propia plaza e invitando a la comunidad del club a ocupar las plazas restantes. 

Cada jugador abona únicamente su parte proporcional (`totalPrice / maxPlayers`) y la reserva queda confirmada ante el club, optimizando la ocupación de pistas y fomentando la comunidad de jugadores.

Actualmente contamos con el motor de disponibilidad y reservas completas (`bookingType: FULL`). Las entidades de base de datos (`BookingParticipant`, `BookingType.OPEN`, `ParticipantStatus`, `Facility.maxPlayers`) ya fueron preparadas en el modelado inicial de Prisma.

## Problema que Resuelve
1. **Falta de jugadores completos:** Los jugadores individuales o parejas no pueden jugar si no coordinan a 4 personas de antemano.
2. **Distribución equitativa del coste:** En lugar de que un solo usuario pague el 100% de la pista (ej. 24€), el sistema divide el coste individualmente (ej. 6€/plaza) registrando a cada participante.
3. **Exploración comunitaria en el Portal:** Los jugadores necesitan una sección dedicada en `spt-portal` para descubrir qué partidas abiertas tienen plazas disponibles, por deporte, fecha, nivel y horario, y unirse con un solo clic.

## Solución Propuesta

### 1. Backend (`apps/backend`)
- **Creación de Partida Abierta (`POST /api/v1/bookings` con `bookingType: OPEN`):**
  - El anfitrión reserva la pista especificando `bookingType: OPEN`.
  - Se calcula el precio total de la pista según `PricingRule` y el precio por plaza `individualPrice = totalPrice / facility.maxPlayers`.
  - Se crea la reserva con `bookingType: OPEN` y automáticamente el primer participante (`BookingParticipant`) con `isHost: true`, `slotNumber: 1`, `userId: host.id`.
- **Listado de Partidas Abiertas Disponibles (`GET /api/v1/bookings/open`):**
  - Consulta partidas futuras con `bookingType: OPEN`, estado `CONFIRMED` o `PENDING_CONFIRMATION`, que aún tengan plazas disponibles (`participantes registrados < maxPlayers`).
  - Filtros opcionales por fecha y deporte (`sportType`).
  - Devuelve información de la instalación, anfitrión, plazas totales, plazas ocupadas, participantes inscritos y precio por plaza.
- **Unirse a una Partida Abierta (`POST /api/v1/bookings/:id/join`):**
  - Valida que la partida sea de tipo `OPEN` y esté activa.
  - Valida que el usuario no esté ya inscrito como participante activo.
  - Valida que queden plazas libres (`currentCount < maxPlayers`) de forma atómica mediante transacción Prisma.
  - Asigna el siguiente `slotNumber` libre y crea el registro `BookingParticipant`.
  - Crea el registro de `Payment` individual en estado `PENDING`.
- **Abandonar / Cancelar Participación (`DELETE /api/v1/bookings/:id/leave`):**
  - Permite a un participante secundario cancelar su plaza, liberando el slot para otro jugador.
  - Si el anfitrión abandona y es el único, se cancela la partida completa. Si hay otros jugadores, se puede transferir el rol de anfitrión al segundo participante o cancelar con preaviso.

### 2. Frontend (`apps/frontend/projects/spt-portal`)
- **Pestaña/Vista "Partidas Abiertas" (`OpenMatchesComponent`):**
  - Selector de deporte y filtro por fecha.
  - Tarjetas de partidas con diseño *Athletic Luxury*:
    - Pista, deporte, fecha y hora.
    - Indicador visual de plazas (ej: 4 círculos/avatares donde se ven los jugadores confirmados y los huecos "Libre").
    - Precio por plaza destacado con `currency`.
    - Botón de acción rápido ("Unirme", "Ya inscrito", "Completa").
- **Modal de Confirmación para Unirse:**
  - Desglose del precio individual y política de pago en el club.
  - Consumo obligatorio de directivas PrimeNG (`pButton`, `pDialog`, `pTag`).
  - Servicios centralizados de notificación (`NotificationService`) y confirmación (`ConfirmDialogService`).

## Criterios de Aceptación (CA)
- **CA-1: Reserva Inicial como Anfitrión:** Un usuario puede crear una reserva de tipo `OPEN`. El sistema registra automáticamente al usuario como `isHost: true` en el slot 1 y calcula el `individualPrice`.
- **CA-2: Control Estricto de Aforo:** No se puede superar el número máximo de participantes (`facility.maxPlayers`, típicamente 4 en pádel y 2 o 4 en tenis). Peticiones concurrentes cuando queda 1 plaza deben rechazar la segunda con `409 Conflict`.
- **CA-3: Prevención de Inscripción Duplicada:** Un usuario no puede unirse dos veces a la misma partida.
- **CA-4: Visualización y Filtros en Portal:** El jugador puede ver las partidas abiertas en `spt-portal`, distinguir qué plazas están libres y unirse con un solo clic.
- **CA-5: Cero textos hardcodeados y Estilos del Sistema:** Todo el texto traducido con `ngx-translate` (`PORTAL.OPEN_MATCHES.*`) y uso estricto de tokens de diseño y responsive mixins.
