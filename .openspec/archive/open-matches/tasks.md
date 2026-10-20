# Tareas: Partidas Abiertas y Reserva por Plazas (`open-matches`)

## Fase 1: Backend (`apps/backend`)
- [x] 1.1 Crear DTOs para partidas abiertas (`OpenMatchResponseDto`, `OpenMatchParticipantDto`) y actualizar `CreateBookingDto` para admitir `bookingType: OPEN`
- [x] 1.2 Extender `BookingsService` con la creación de anfitrión en `createBooking` cuando `bookingType === 'OPEN'`
- [x] 1.3 Implementar `findOpenMatches` en `BookingsService` con cálculo de plazas restantes y participantes
- [x] 1.4 Implementar `joinOpenMatch` y `leaveOpenMatch` en `BookingsService` con transacciones atómicas contra concurrencia
- [x] 1.5 Exponer los endpoints en `BookingsController`:
  - `GET /api/v1/bookings/open`
  - `POST /api/v1/bookings/:id/join`
  - `DELETE /api/v1/bookings/:id/leave`
- [x] 1.6 Escribir pruebas unitarias en `bookings.service.spec.ts` para cubrir aforo máximo, unión y abandono
- [x] 1.7 Validar suite de backend con `npm run test`

## Fase 2: Sincronización OpenAPI y @core
- [x] 2.1 Regenerar cliente API y tipos con Orval (`npm run api:generate`)
- [x] 2.2 Exportar nuevos modelos y métodos desde `@core`

## Fase 3: Frontend (`spt-portal`)
- [x] 3.1 Añadir traducciones al diccionario central `es.json` bajo la clave `PORTAL.OPEN_MATCHES`
- [x] 3.2 Crear componente `OpenMatchesComponent` con vista de tarjetas, visualizador de plazas/avatares y filtros
- [x] 3.3 Integrar modal de confirmación para unirse y abandonar mediante `ConfirmDialogService` y `NotificationService`
- [x] 3.4 Configurar ruta `/portal/open-matches` en `app.routes.ts` y enlace en el menú de navegación
- [x] 3.5 Escribir pruebas unitarias para `OpenMatchesComponent` (`npx ng test spt-portal`)

## Fase 4: Calidad y Cierre
- [x] 4.1 Ejecutar suite completa de tests de frontend y backend
- [x] 4.2 Sincronizar grafo de dependencias con `npm run codegraph:sync`
