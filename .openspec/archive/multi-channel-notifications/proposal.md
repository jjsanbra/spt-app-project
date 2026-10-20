# Propuesta: Notificaciones Multi-canal en Tiempo Real (`multi-channel-notifications`)

## Contexto de Negocio
En una plataforma deportiva, la comunicación instantánea es crítica para la retención y la experiencia del usuario. Los socios y jugadores necesitan enterarse de inmediato cuando:
1. Su reserva de pista se ha confirmado o cancelado con éxito.
2. Otro jugador se ha unido a su partida abierta o la partida se ha completado.
3. El club emite avisos de interés (mantenimiento, alertas climáticas o torneos).

Actualmente las reservas y partidas abiertas funcionan en base de datos, pero el usuario no recibe ningún aviso pasivo ni en tiempo real si no recarga manualmente la página.

## Problema que Resuelve
- **Falta de visibilidad de eventos:** El anfitrión de una partida abierta no sabe cuándo se cubren las plazas a menos que consulte constantemente el portal.
- **Falta de confirmación transaccional:** Los jugadores no disponen de un historial o bandeja de notificaciones en la aplicación que certifique los cambios en sus pistas o reservas.
- **Experiencia de usuario estática:** Se requiere un canal en tiempo real (WebSockets / En-App) y preparación para Email transaccional.

## Solución Propuesta

### 1. Backend (`apps/backend`) — Módulo `NotificationsModule`
- **Persistencia En-App:** Guardar cada evento en la entidad `Notification` de PostgreSQL (`userId`, `title`, `message`, `type`, `metadata`, `isRead`).
- **WebSocket Gateway (`NotificationsGateway`):**
  - Gateway de Socket.io en NestJS autenticado mediante JWT.
  - Conexión de sockets asignando salas privadas por usuario (`user:<userId>`) y por club (`club:<clubId>`).
  - Emisión en tiempo real de eventos `notification:new` para que el navegador actualice el contador y muestre un toast al instante.
- **Canal de Email Transaccional (`EmailNotificationService`):**
  - Servicio desacoplado para envío de correos con plantillas HTML limpias para confirmación de reserva y avisos de partidas abiertas.
- **Endpoints REST (`NotificationsController`):**
  - `GET /api/v1/notifications`: Listado de notificaciones del usuario autenticado con orden cronológico descendente y total de no leídas.
  - `PATCH /api/v1/notifications/:id/read`: Marcar notificación individual como leída.
  - `PATCH /api/v1/notifications/read-all`: Marcar todas las notificaciones del usuario como leídas.
- **Desencadenantes automáticos desde `BookingsService`:**
  - Al crear reserva: notificación de confirmación.
  - Al unirse a partida abierta: notificación al anfitrión (`OPEN_GAME_JOINED`) y a los demás jugadores.
  - Al completarse la partida: notificación `OPEN_GAME_COMPLETE` a todos los participantes.
  - Al cancelar: notificación de cancelación.

### 2. Frontend (`apps/frontend/projects/spt-app`)
- **Campana de Notificaciones en el Navbar (`NotificationBellComponent`):**
  - Icono de campana PrimeNG con `pBadge` reactivo con el número de notificaciones no leídas.
  - Panel desplegable (`p-overlayPanel`) con el listado de notificaciones recientes, tiempo transcurrido (hace X min), estado de lectura y botón "Marcar todas como leídas".
  - Recepción de eventos en tiempo real mediante WebSocket y toasts emergentes con `NotificationService`.
- **Integración global:** El componente reside en el Shell host (`spt-app`) por lo que está disponible en todos los microfrontends (`spt-admin`, `spt-portal`, `spt-users`).

## Criterios de Aceptación (CA)
- **CA-1: Persistencia y Aislamiento Multi-Tenant:** Toda notificación se guarda con su `userId` y `clubId` correspondiente. Ningún usuario puede ver notificaciones ajenas.
- **CA-2: Tiempo Real (WebSocket):** Al dispararse un evento en el backend, el cliente conectado recibe el evento vía Socket.io de forma inmediata sin necesidad de refrescar la página.
- **CA-3: Contador y Lectura:** Al marcar notificaciones como leídas, el contador del badge se actualiza a 0.
- **CA-4: Integración Automática en Reservas:** Crear, unirse o cancelar reservas y partidas abiertas genera de forma transparente la notificación correspondiente.
- **CA-5: 100% Internacionalizado y Tokens:** Todo texto consume `es.json` bajo `NOTIFICATIONS.*`, y los componentes visuales usan tokens del Athletic Luxury Design System y directivas PrimeNG.
