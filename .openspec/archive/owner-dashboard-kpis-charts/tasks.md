# Tareas: Implementación de Dashboards Jerárquicos por Rol

## Fase 1: Backend NestJS — Endpoints y Métricas Agregadas
- [x] 1.1 Crear DTOs tipados en backend (`ClubDashboardResponseDto`, `UserDashboardResponseDto`, `SuperadminOverviewResponseDto`).
- [x] 1.2 Implementar agregaciones de métricas de club en `clubs.service.ts` con aislamiento estricto por `club_id`.
- [x] 1.3 Exponer endpoints seguros en `clubs.controller.ts` (`/clubs/:clubId/dashboard` y `/clubs/:clubId/dashboard/operational`).
- [x] 1.4 Implementar endpoint de analítica de socio en `users.controller.ts` (`GET /users/me/dashboard`).
- [x] 1.5 Pruebas unitarias de servicios y controladores en backend.

## Fase 2: Sincronización API (@core y Orval)
- [x] 2.1 Regenerar contratos de TypeScript y servicios cliente con `npm run api:generate`.
- [x] 2.2 Verificar tipado e importaciones en `@core`.

## Fase 3: Frontend `spt-admin` — Dashboards de Superadmin, Owner y Staff
- [x] 3.1 Integrar `ChartModule` (`<p-chart>`) y componentes PrimeNG en `DashboardComponent`.
- [x] 3.2 Condicionar vistas por rol: Staff (Operativa Hoy), Owner/Admin (Operativa + Financiero + Gráficas), Superadmin (Métricas Plataforma + Selector Club).
- [x] 3.3 Configurar estilos Stitch con tokens CSS y modo oscuro para Chart.js.
- [x] 3.4 Añadir traducciones completas en `es.json`.

## Fase 4: Frontend `spt-portal` — Dashboard del Jugador / Socio
- [x] 4.1 Actualizar `PortalHomeComponent` para consumir `usersService.usersControllerGetMyDashboard()`.
- [x] 4.2 Maquetar tarjetas de Próxima Reserva (con cuenta atrás interactiva) y estadísticas del jugador.
- [x] 4.3 Pruebas unitarias en `portal-home.component.spec.ts`.

## Fase 5: Verificación Integral y Calidad
- [x] 5.1 Ejecutar `npm run test:frontend` (100% de tests pasando).
- [x] 5.2 Ejecutar `npm run build:all`.
- [x] 5.3 Validar especificaciones con `npm run spec:check`.
