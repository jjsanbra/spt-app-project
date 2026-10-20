# Tareas: Motor de Disponibilidad y Reservas (`booking-engine-availability`)

## Fase 1: Backend (`apps/backend`)
- [x] 1.1 Crear DTOs para disponibilidad y reservas (`TimeSlotAvailabilityDto`, `FacilityAvailabilityResponseDto`, `CreateBookingDto`, `CancelBookingDto`, `BookingResponseDto`)
- [x] 1.2 Implementar motor de cálculo de disponibilidad en memoria (`FacilitiesAvailabilityService` / `FacilitiesController`)
- [x] 1.3 Implementar servicio y controlador de reservas (`BookingsService` y `BookingsController`) con transacciones seguras contra concurrencia
- [x] 1.4 Registrar `BookingsModule` en `AppModule`
- [x] 1.5 Escribir pruebas unitarias para el motor de disponibilidad y prevención de solapamientos de reservas
- [x] 1.6 Validar compilación y tests del backend (`npm run test`)

## Fase 2: Sincronización OpenAPI y @core
- [x] 2.1 Regenerar cliente API y tipos con Orval (`npm run api:generate`)
- [x] 2.2 Exportar `BookingsService` y modelos en `@core`

## Fase 3: Frontend (`spt-portal`)
- [x] 3.1 Añadir traducciones al diccionario `apps/frontend/projects/spt-app/src/assets/i18n/es.json` y `public/assets/i18n/es.json` bajo la clave `PORTAL.BOOKINGS`
- [x] 3.2 Crear componente de matriz/grid de reservas `BookingsGridComponent` con selector de fechas, filtros por deporte y modal de confirmación
- [x] 3.3 Crear componente de listado `MyBookingsComponent` con tarjetas de reservas activas y cancelación
- [x] 3.4 Configurar rutas `/portal/book` y `/portal/my-bookings` en `spt-portal/app.routes.ts` y enlaces en `portal-home`
- [x] 3.5 Escribir pruebas unitarias para `BookingsGridComponent` y `MyBookingsComponent` (`npx ng test spt-portal`)

## Fase 4: Validación y Calidad
- [x] 4.1 Ejecutar suite completa de tests de frontend y backend
- [x] 4.2 Sincronizar grafo de arquitectura con `npm run codegraph:sync`
