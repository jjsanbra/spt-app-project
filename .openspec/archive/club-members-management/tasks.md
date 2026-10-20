# Tareas: Gestión de Miembros y Roles del Club (`club-members-management`)

## Fase 1: Backend (`apps/backend`)
- [x] 1.1 Crear DTOs para miembros (`ClubMemberResponseDto`, `InviteMemberDto`, `UpdateMemberRoleDto`, `UpdateMemberStatusDto`)
- [x] 1.2 Implementar `ClubsMembersService` y `ClubsMembersController` con guards de autenticación, tenant (`TenantGuard`) y roles (`@Roles('OWNER', 'ADMIN')`)
- [x] 1.3 Registrar endpoints en `ClubsModule` / `AppModule`
- [x] 1.4 Escribir pruebas unitarias para `ClubsMembersService` (cobertura de reglas multi-tenant y protección del último OWNER)
- [x] 1.5 Validar compilación y tests del backend (`npm run test`)

## Fase 2: Sincronización OpenAPI y @core
- [x] 2.1 Regenerar cliente API y tipos con Orval (`npm run api:generate`)
- [x] 2.2 Verificar la exportación de tipos y funciones en `@core`

## Fase 3: Frontend (`spt-admin`)
- [x] 3.1 Añadir traducciones al diccionario `apps/frontend/projects/spt-app/src/assets/i18n/es.json` bajo la clave `ADMIN.MEMBERS`
- [x] 3.2 Crear componente standalone `ClubMembersComponent` con PrimeNG (`pTable`, `pButton`, `pTag`, `pDialog`, `pSelect`, `pInputText`)
- [x] 3.3 Integrar `NotificationService` y `ConfirmDialogService` desde `@core`
- [x] 3.4 Maquetar estilos con tokens semánticos en `club-members.component.scss` (sin colores ni tamaños hardcodeados)
- [x] 3.5 Configurar ruta `/members` en `app.routes.ts` y enlace en la barra de navegación de `spt-admin`
- [x] 3.6 Escribir pruebas unitarias para `ClubMembersComponent` (`npm run test:admin`)

## Fase 4: Validación y Calidad
- [x] 4.1 Ejecutar suite completa de tests de frontend y backend
- [x] 4.2 Sincronizar grafo de arquitectura con `npm run codegraph:sync`
