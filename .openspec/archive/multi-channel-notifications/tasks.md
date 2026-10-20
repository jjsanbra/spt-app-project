# Tareas: Notificaciones Multi-canal en Tiempo Real (`multi-channel-notifications`)

## Fase 1: Backend (`apps/backend`)
- [x] 1.1 Crear DTOs para notificaciones (`NotificationResponseDto`, `NotificationListResponseDto`, `CreateNotificationInput`)
- [x] 1.2 Implementar `NotificationsService` con lógica de guardado, listado y marcado de lectura
- [x] 1.3 Implementar `NotificationsGateway` con Socket.io autenticado por JWT y salas por usuario (`user:<userId>`)
- [x] 1.4 Crear `EmailNotificationService` para envío simulado/transaccional desacoplado
- [x] 1.5 Crear `NotificationsController` con endpoints `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- [x] 1.6 Crear y registrar `NotificationsModule` en `AppModule`
- [x] 1.7 Conectar eventos de `BookingsService` con `NotificationsService` (reserva confirmada, usuario se une a partida, partida completa, cancelación)
- [x] 1.8 Escribir pruebas unitarias para `NotificationsService` y validar con `npm run test:backend`

## Fase 2: Sincronización OpenAPI y @core
- [x] 2.1 Exportar OpenAPI 3.0 actualizado (`npm run swagger:export`)
- [x] 2.2 Regenerar cliente API y tipos con Orval (`npm run api:generate`)
- [x] 2.3 Exportar `NotificationsService`, `RealtimeNotificationsService` y nuevos modelos en `@core`

## Fase 3: Frontend Shell (`spt-app`)
- [x] 3.1 Añadir traducciones al diccionario central `es.json` bajo la clave `NOTIFICATIONS` y replicar a paths públicos
- [x] 3.2 Crear servicio reactivo `RealtimeNotificationsService` en `@core` para gestión de notificaciones y conexión WebSocket en tiempo real
- [x] 3.3 Crear componente `NotificationBellComponent` con overlay panel, badges y marcado como leído
- [x] 3.4 Integrar la campana en la barra de navegación del Shell host (`spt-app`)
- [x] 3.5 Escribir pruebas unitarias para `NotificationBellComponent` (`npx ng test spt-app`)

## Fase 4: Validación y Calidad
- [x] 4.1 Ejecutar suite completa de tests de frontend y backend (130 tests en verde)
- [x] 4.2 Sincronizar grafo de arquitectura con `npm run codegraph:sync`
