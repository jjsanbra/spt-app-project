# Tareas: Módulo SuperAdmin para Alta y Gestión de Clubes (`superadmin-club-management`)

## Fase 1: Backend (`apps/backend`)
- [x] 1.1 Crear `SuperAdminGuard` en `apps/backend/src/auth/guards/super-admin.guard.ts`
- [x] 1.2 Crear DTOs en `apps/backend/src/superadmin/dto/`:
  - `CreateClubDto` con validaciones de slug, email y rangos horarios
  - `UpdateSuperAdminClubDto` para edición de datos y alternancia de estado
  - `SuperAdminClubResponseDto` y `SuperAdminClubListResponseDto`
- [x] 1.3 Implementar `SuperAdminClubsService` en `apps/backend/src/superadmin/superadmin-clubs.service.ts`:
  - `findAll(search?: string, isActive?: boolean)`
  - `findById(id: string)`
  - `createClub(dto: CreateClubDto)` con transacción para crear club y asignar `OWNER`
  - `updateClub(id: string, dto: UpdateSuperAdminClubDto)`
  - `toggleStatus(id: string)`
- [x] 1.4 Implementar `SuperAdminClubsController` en `apps/backend/src/superadmin/superadmin-clubs.controller.ts` bajo `/api/v1/superadmin/clubs`
- [x] 1.5 Crear `SuperAdminModule` y registrarlo en `AppModule`
- [x] 1.6 Escribir pruebas unitarias para `SuperAdminClubsService` y validar con `npm run test:backend`

## Fase 2: Sincronización OpenAPI y @core
- [x] 2.1 Exportar OpenAPI 3.0 actualizado (`npm run swagger:export`)
- [x] 2.2 Regenerar cliente API y tipos con Orval (`npm run api:generate`)
- [x] 2.3 Exportar `SuperAdminClubsService` y modelos generados en `@core`

## Fase 3: Frontend (`spt-admin` & Shell)
- [x] 3.1 Añadir traducciones al diccionario central `es.json` bajo la clave `SUPERADMIN` y replicar a directorios públicos
- [x] 3.2 Crear componente `SuperAdminClubsComponent` en `apps/frontend/projects/spt-admin/src/app/pages/superadmin/clubs/`:
  - Tabla PrimeNG `p-table` con paginación, filtros y badges
  - Modal PrimeNG `p-dialog` con formulario reactivo para alta de nuevo club
  - Notificaciones centralizadas (`NotificationService`) y confirmaciones (`ConfirmDialogService`)
- [x] 3.3 Configurar ruta `/superadmin/clubs` en `spt-admin/src/app/app.routes.ts`
- [x] 3.4 Actualizar la barra de navegación del Shell (`spt-app/app.html`) para mostrar enlace SuperAdmin cuando `authService.isSuperAdmin()` sea verdadero
- [x] 3.5 Escribir pruebas unitarias para `SuperAdminClubsComponent` (`npx ng test spt-admin`)

## Fase 4: Validación y Calidad
- [x] 4.1 Ejecutar suite completa de tests de backend (`npm run test:backend`)
- [x] 4.2 Ejecutar suite completa de tests de frontend (`npm run test:frontend`)
- [x] 4.3 Sincronizar grafo de arquitectura con `npm run codegraph:sync`
