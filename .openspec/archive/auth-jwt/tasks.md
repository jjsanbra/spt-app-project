# Tasks: auth-jwt (Fase 2)

**Fecha:** 2026-10-20  
**Estado:** 🟢 Completado  

---

## Tareas de Implementación

- [x] **1. Backend: Módulos de Autenticación y Usuarios (`apps/backend`)**
  - [x] 1.1 Crear DTOs de autenticación con `class-validator` y decoradores Swagger (`RegisterDto`, `LoginDto`, `RefreshTokenDto`, `UpdateProfileDto`)
  - [x] 1.2 Implementar `JwtStrategy` con Passport para validar y extraer el payload del token
  - [x] 1.3 Crear `TenantGuard` para validar la cabecera `x-tenant-id` contra `ClubMembership`
  - [x] 1.4 Crear `RolesGuard` y decorador `@Roles(...)` para control de acceso basado en roles (`OWNER`, `ADMIN`, `STAFF`, `MEMBER`)
  - [x] 1.5 Implementar `AuthService` (registro con bcrypt, login con generación de tokens, refresh y consulta de perfil multi-club)
  - [x] 1.6 Implementar `AuthController` (`/api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/me`)
  - [x] 1.7 Implementar `UsersController` (`/api/v1/users/profile`)
  - [x] 1.8 Registrar `AuthModule` y `UsersModule` en `AppModule`

- [x] **2. Contratos OpenAPI y Generación Tipada con Orval**
  - [x] 2.1 Crear script de exportación de OpenAPI `scripts/export-swagger.ts`
  - [x] 2.2 Exportar especificación a `apps/backend/openapi.json`
  - [x] 2.3 Configurar Orval en `apps/frontend/orval.config.ts` (o `package.json`) apuntando a `@core` (`libs/core`)
  - [x] 2.4 Ejecutar `npm run api:generate` para generar los clientes e interfaces tipadas

- [x] **3. Capa Compartida `@core` (`libs/core`)**
  - [x] 3.1 Implementar `AuthService` reactivo con Angular Signals (`currentUser`, `activeClub`, `isAuthenticated`, `tokens`)
  - [x] 3.2 Implementar `AuthInterceptor` para inyectar automáticamente `Authorization: Bearer <token>` y `x-tenant-id`
  - [x] 3.3 Implementar `AuthGuard` de Angular para proteger rutas privadas

- [x] **4. Microfrontend Remoto `spt-users` (`apps/frontend/projects/spt-users`)**
  - [x] 4.1 Crear `LoginComponent` con directivas PrimeNG (`pCard`, `pInputText`, `pPassword`, `pButton`, `pFloatLabel`)
  - [x] 4.2 Crear `RegisterComponent` con formulario reactivo y directivas PrimeNG
  - [x] 4.3 Crear `ProfileComponent` con visualización de membresías por club, roles (`pBadge`/`p-tag`) y saldo de monedero
  - [x] 4.4 Integrar selector y cambio de club activo en `ProfileComponent` y `AuthService`
  - [x] 4.5 Configurar rutas en `projects/spt-users/src/app/app.routes.ts`

- [x] **5. Integración en Shell Host `spt-app` e Internacionalización**
  - [x] 5.1 Actualizar layout y navbar del Shell para reflejar el estado de sesión (nombre, club activo, monedero, logout)
  - [x] 5.2 Añadir todas las claves de traducción en `projects/spt-app/src/assets/i18n/es.json`
  - [x] 5.3 Configurar estilos con tokens semánticos de `_variables.scss` y mixins de `_responsive.scss`

- [x] **6. Verificación, CodeGraph y Cierre**
  - [x] 6.1 Probar flujo de registro y login con validaciones completas
  - [x] 6.2 Comprobar compilación completa (`npm run build:backend` y `npm run build:all`)
  - [x] 6.3 Sincronizar índice de dependencias (`npm run codegraph:sync`)

