# Tareas: Gestión Global de Bloqueos por Pista y Deporte

## Fase 1: Backend (DTOs, Servicio y Controlador)
- [x] 1.1 Crear `BulkCreateFacilityBlockDto` en `apps/backend/src/facilities/dto/bulk-create-facility-block.dto.ts`.
- [x] 1.2 Actualizar `FacilityBlockResponseDto` para incluir opcionalmente `facilityName` y `sportType`.
- [x] 1.3 Implementar método `findClubBlocks(clubId, sportType?, facilityId?)` en `FacilitiesService` con `include: { facility: true }` y mapeo a DTO enriquecido.
- [x] 1.4 Implementar método `createBulkBlocks(clubId, dto, userId)` en `FacilitiesService` con validación multi-tenant y transacción Prisma.
- [x] 1.5 Añadir endpoints `GET /facilities/blocks` y `POST /facilities/blocks/bulk` en `FacilitiesController`.
- [x] 1.6 Actualizar pruebas unitarias en `facilities.controller.spec.ts` y `facilities.service.spec.ts`.

## Fase 2: Sincronización API y Modelos Frontend
- [x] 2.1 Regenerar clientes de API y DTOs con `npm run api:generate` (Orval).
- [x] 2.2 Verificar tipos exportados desde `@core` (`BulkCreateFacilityBlockDto`, `FacilityBlockResponseDto`).

## Fase 3: Frontend (spt-admin)
- [x] 3.1 Actualizar `FacilityBlocksComponent` (`facility-blocks.component.ts`):
  - Gestión de filtros reactivos por deporte (`SportType`) y por pista.
  - Carga global de bloqueos del club vía nuevo endpoint `facilitiesControllerFindClubBlocks`.
  - Formulario reactivo para creación individual o masiva por deporte / pistas múltiples.
- [x] 3.2 Actualizar plantilla `facility-blocks.component.html`:
  - Selector de deporte y pista en slot `filters` de `spt-page-header`.
  - Nueva tabla con columnas de Deporte (`p-tag`), Pista (`facilityName`), Título, Motivo, Inicio, Fin y Acciones.
  - Modal con selección de deporte y modo de aplicación ("Pista concreta" vs "Todas las pistas de este deporte").
- [x] 3.3 Añadir claves de internacionalización faltantes en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
- [x] 3.4 Actualizar pruebas unitarias en `facility-blocks.component.spec.ts`.

## Fase 4: Validación y Cobertura
- [x] 4.1 Ejecutar suite completa de pruebas unitarias y cobertura (`npm run test` y `node scripts/check-coverage-diff.js`).
- [x] 4.2 Validar navegación e integración en entorno local.
