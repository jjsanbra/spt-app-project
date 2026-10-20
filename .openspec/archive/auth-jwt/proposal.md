# Proposal: auth-jwt (Fase 2)

**Fecha:** 2026-10-20  
**Estado:** ✅ Completado
**Archivado:** 2026-10-20  
**Autor:** Antigravity Architect  

---

## 1. Contexto y Motivación

SPT App es un SaaS deportivo multi-tenant donde los usuarios disponen de una única cuenta global pero pueden pertenecer a múltiples clubes con diferentes roles (`OWNER`, `ADMIN`, `STAFF`, `MEMBER`, `GUEST`) o ser administradores de la plataforma global (`isSuperAdmin`).

Para operar de forma segura y consistente entre los microfrontends (`spt-app`, `spt-admin`, `spt-portal`, `spt-users`), es indispensable implementar un sistema de autenticación robusto basado en **JWT (Access + Refresh Tokens)**, complementado con:
1. Resolución estricta de tenant activo mediante la cabecera `x-tenant-id`.
2. Guardias de autorización de roles jerárquicos en NestJS.
3. Propagación reactiva del estado del usuario mediante Signals en Angular.
4. Generación automática de contratos e interfaces tipadas desde OpenAPI hacia `@core`.

---

## 2. Solución Propuesta

### A. Backend (`apps/backend` — Módulos `AuthModule` y `UsersModule`)
- **Autenticación JWT:** Emisión de `access_token` (vida corta: 15 min) y `refresh_token` (vida larga: 7 días), con contraseñas hasheadas mediante `bcrypt` (10 rondas de salt).
- **Endpoints de la API REST (`/api/v1/auth` y `/api/v1/users`):**
  - `POST /api/v1/auth/register`: Registro de nuevos usuarios con email único.
  - `POST /api/v1/auth/login`: Autenticación por email/password; retorna tokens y perfil base.
  - `POST /api/v1/auth/refresh`: Emisión de nuevo `access_token` a partir de un `refresh_token` válido.
  - `POST /api/v1/auth/logout`: Revocación de sesión.
  - `GET /api/v1/auth/me`: Retorna los datos del usuario autenticado, sus membresías activas con rol en cada club y saldo de monedero.
  - `PUT /api/v1/users/profile`: Actualización de datos de perfil (nombre, apellidos, teléfono).
- **Seguridad y Guards:**
  - `JwtAuthGuard`: Valida el Bearer Token en peticiones protegidas.
  - `TenantGuard`: Extrae la cabecera `x-tenant-id`, valida que el club exista y que el usuario tenga una membresía activa (`ClubMembership`) con el rol necesario.
  - `RolesGuard`: Decorador `@Roles(...)` para restringir endpoints según el rol en el club.
  - Decoradores personalizados: `@CurrentUser()` y `@CurrentTenant()`.

### B. Capa Compartida `@core` (`libs/core`)
- **Contratos Tipados:** Clientes HTTP e interfaces generadas automáticamente por **Orval** desde `openapi.json`.
- **`AuthService`:** Servicio reactivo basado en Angular Signals (`currentUser`, `activeClub`, `isAuthenticated`, `userRoles`).
- **`AuthInterceptor`:** Inyecta automáticamente `Authorization: Bearer <token>` y la cabecera `x-tenant-id` en cada petición HTTP saliente.
- **`AuthGuard`:** Protege rutas en el enrutador de Angular redirigiendo a `/users/login` si no hay sesión.

### C. Frontend (`apps/frontend/projects/spt-users` y Shell `spt-app`)
- **Páginas en `spt-users` (Puerto 4203):**
  - **Login:** Formulario reactivo con directivas PrimeNG obligatorias (`pCard`, `pInputText`, `pPassword`, `pButton`).
  - **Registro:** Formulario con validación visual y confirmación de contraseña.
  - **Selector de Club:** Modal / selector accesible para usuarios que pertenecen a más de un centro deportivo, actualizando el tenant activo.
  - **Mi Perfil:** Visualización de datos personales, membresías y saldo en el monedero del club.
- **Integración en Shell `spt-app` (Puerto 4200):**
  - Barra de navegación (`Navbar`) que refleja el estado de sesión (avatar/nombre, saldo de monedero, club activo, botón de logout).
  - Carga diferida del microfrontend `spt-users` vía Native Federation en la ruta `/users/*`.

---

## 3. Criterios de Aceptación

- [ ] **CA-01 (Registro y Hasheo):** `POST /api/v1/auth/register` crea un usuario en PostgreSQL con contraseña hasheada con `bcrypt`. Falla con `409 Conflict` si el email ya existe.
- [ ] **CA-02 (Login y Tokens):** `POST /api/v1/auth/login` valida credenciales y retorna `accessToken`, `refreshToken` y objeto `user`.
- [ ] **CA-03 (Renovación de Token):** `POST /api/v1/auth/refresh` valida el refresh token y emite un nuevo `accessToken` válido sin requerir relogin.
- [ ] **CA-04 (Contexto Multi-tenant en `me`):** `GET /api/v1/auth/me` retorna el usuario junto con su listado de clubes y roles (`ClubMembership[]`).
- [ ] **CA-05 (Guard de Tenant):** `TenantGuard` rechaza con `403 Forbidden` si la cabecera `x-tenant-id` no corresponde a un club donde el usuario esté registrado.
- [ ] **CA-06 (Contratos Orval y @core):** Swagger exporta `openapi.json` y Orval genera los clientes tipados en `@core`. Ningún componente declara interfaces manuales duplicadas.
- [ ] **CA-07 (UI con Directivas PrimeNG y pButton):** Las vistas de login, registro y perfil en `spt-users` utilizan directivas PrimeNG (`pButton`, `pInputText`, `pCard`, etc.), tokens semánticos de `_variables.scss` y cero `@media` manuales.
- [ ] **CA-08 (i18n):** Todo texto visible pasa obligatoriamente por `ngx-translate` con claves en `es.json`.

---

## 4. Impacto Estimado

- **Backend:** Creación de módulos `auth` y `users`, DTOs con `class-validator`, estrategias Passport JWT y Guards.
- **Frontend:** Implementación de vistas en `projects/spt-users`, servicios e interceptor en `@core`, integración en navbar del Shell `spt-app`.
- **Base de datos:** Ningún cambio de esquema (las tablas `User` y `ClubMembership` creadas en Fase 1 cubren todos los campos).
- **Riesgo:** 🟢 Bajo (esquema ya validado, no hay operaciones destructivas).

---

## 5. Dependencias

- **Fase 1 (Modelado de Dominio):** Completada y migrada en PostgreSQL (commit `b937f1b`).
- Contenedor de PostgreSQL 16 y Redis 7 activos en OrbStack (puerto 5433).
