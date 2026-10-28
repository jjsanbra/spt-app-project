# Tareas: Selector de Club en Topbar y Modal de Cambio de Club con Buscador

## Fase 1: Backend y Contratos OpenAPI
- [x] 1.1 Añadir `clubCity` al DTO `ClubMembershipSummaryDto` en `apps/backend/src/auth/dto/auth-response.dto.ts` con `@ApiPropertyOptional`.
- [x] 1.2 Mapear `clubCity: m.club.city ?? null` y `c.city ?? null` en `AuthService.mapUserSummary` (`apps/backend/src/auth/auth.service.ts`).
- [x] 1.3 Verificar tests unitarios del backend (`npm run test:backend`).
- [x] 1.4 Regenerar clientes y DTOs frontend con `npm run api:generate` (Orval).

## Fase 2: Shell y Estilos (Design System)
- [x] 2.1 Retirar bloque `sidebar-club-card` de `apps/frontend/projects/spt-app/src/app/app.html` y limpiar clases asociadas en `app.scss`.
- [x] 2.2 Diseñar el nuevo bloque de contexto en el topbar con nombre del club ampliado, ciudad con icono y botón "Cambiar de club".
- [x] 2.3 Añadir estilos responsivos con tokens semánticos en `app.scss` para el nuevo topbar.

## Fase 3: Modal de Cambio de Club (`p-dialog`) con Buscador y Lógica
- [x] 3.1 Importar módulos necesarios en `apps/frontend/projects/spt-app/src/app/app.ts` (`DialogModule`, `FormsModule`, `IconFieldModule`, `InputIconModule`, `InputTextModule`).
- [x] 3.2 Añadir estado reactivo `changeClubDialogVisible`, signal `clubSearchTerm` y computed `filteredMemberships`.
- [x] 3.3 Implementar buscador `p-iconfield` + `input pInputText` en la cabecera de la modal para filtrar por nombre o ciudad.
- [x] 3.4 Implementar la plantilla del diálogo modal en `app.html` con listado reactivo de tarjetas, badges de rol y estado activo.
- [x] 3.5 Agregar claves de traducción en `apps/frontend/projects/spt-app/src/assets/i18n/es.json` (`USERS.CHANGE_CLUB_MODAL_TITLE`, `USERS.SEARCH_CLUB_PLACEHOLDER`, `USERS.NO_CLUBS_FOUND`).
- [x] 3.6 Manejar redirección segura a `/portal` si se cambia a un club sin permisos de administrador mientras se navega en `/admin/*`.

## Fase 4: Verificación y Calidad
- [x] 4.1 Actualizar o añadir tests unitarios en `app.spec.ts` para verificar la apertura de la modal, filtrado del buscador y cambio de club.
- [x] 4.2 Ejecutar suite completa de tests (`npm test` o `npm run test:frontend`).
- [x] 4.3 Ejecutar compilación de producción `npm run build:all`.
- [x] 4.4 Validar especificaciones con `node scripts/validate-specs.js`.
