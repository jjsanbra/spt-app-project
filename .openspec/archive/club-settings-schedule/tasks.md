# Tareas: Configuración y Horarios del Club (`club-settings-schedule`)

## Fase 1: Backend (`apps/backend`)
- [x] 1.1 Crear DTOs para configuración del club (`ClubSettingsResponseDto`, `UpdateClubSettingsDto`)
- [x] 1.2 Implementar `ClubsService` y `ClubsController` con endpoints `GET /clubs/settings` y `PATCH /clubs/settings`
- [x] 1.3 Validación de reglas de coherencia (`openingHour < closingHour`)
- [x] 1.4 Escribir pruebas unitarias para `ClubsService`
- [x] 1.5 Validar compilación y tests del backend (`npm run test`)

## Fase 2: Sincronización OpenAPI y @core
- [x] 2.1 Regenerar cliente API y tipos con Orval (`npm run api:generate`)
- [x] 2.2 Exportar `ClubsService` y modelos en `@core`

## Fase 3: Frontend (`spt-admin`)
- [x] 3.1 Añadir traducciones al diccionario `apps/frontend/projects/spt-app/src/assets/i18n/es.json` y `public/assets/i18n/es.json` bajo la clave `ADMIN.SETTINGS`
- [x] 3.2 Crear componente standalone `ClubSettingsComponent` con PrimeNG (`pInputText`, `pSelect`, `pInputNumber`, `pButton`)
- [x] 3.3 Integrar `NotificationService` desde `@core`
- [x] 3.4 Maquetar estilos con tokens semánticos en `club-settings.component.scss`
- [x] 3.5 Configurar ruta `/settings` en `app.routes.ts` y acceso en Dashboard
- [x] 3.6 Escribir pruebas unitarias para `ClubSettingsComponent` (`npm run test:admin`)

## Fase 4: Validación y Calidad
- [x] 4.1 Ejecutar suite completa de tests de frontend y backend
- [x] 4.2 Sincronizar grafo de arquitectura con `npm run codegraph:sync`
