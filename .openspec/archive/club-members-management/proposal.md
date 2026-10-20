# Propuesta: Gestión de Miembros y Roles del Club (`club-members-management`)

## Contexto de Negocio
En un sistema SaaS multi-tenant para clubes deportivos (`spt-app-project`), cada club cuenta con administradores (`OWNER` y `ADMIN`) que necesitan gestionar de forma autónoma qué usuarios forman parte de su club, qué rol ostentan en la organización (`OWNER`, `ADMIN`, `MEMBER`, `STAFF`), su estado de actividad (`isActive`) y el saldo de su monedero (`walletBalance`).

Actualmente, las relaciones de membresía existen en la base de datos a través del modelo `ClubMembership`, pero no disponemos de:
1. Endpoints de API REST seguros y aislados por tenant para listar, invitar/añadir miembros, modificar su rol y cambiar su estado de membresía.
2. Una interfaz visual en el microfrontend de administración (`spt-admin`) donde los administradores puedan consultar la lista de socios, ver sus datos, cambiar sus roles mediante un diálogo modal o selectores, invitar a nuevos miembros por email y activar/desactivar membresías con diálogos de confirmación centralizados.

## Solución Propuesta

### 1. Backend (`apps/backend`)
- **Módulo `ClubsModule` / `Members`**:
  - `GET /api/v1/clubs/members`: Listar miembros del club autenticado (extraído vía `x-tenant-id` y `CurrentTenant`). Permite filtrar por rol, búsqueda por nombre/email y estado activo.
  - `POST /api/v1/clubs/members/invite`: Añadir/asociar un usuario existente (por email) o preparar su invitación al club con un rol inicial (`MEMBER`, `ADMIN`, `STAFF`) y número de socio opcional.
  - `PATCH /api/v1/clubs/members/:id/role`: Cambiar el rol de un miembro (`ClubRole`), validando que no se pueda degradar al último `OWNER` del club.
  - `PATCH /api/v1/clubs/members/:id/status`: Activar o desactivar una membresía (`isActive: boolean`).
  - `DELETE /api/v1/clubs/members/:id`: Eliminar una membresía del club (con control de no eliminar al `OWNER` principal).

### 2. Frontend (`apps/frontend/projects/spt-admin`)
- **Página de Miembros (`ClubMembersComponent`)**:
  - Ruta `/admin/members` integrada en el layout y navegación de `spt-admin`.
  - Tabla de datos PrimeNG (`pDataTable`) con avatar, nombre, email, teléfono, número de socio, rol (`pTag`/`pBadge`), estado (`pBadge` activo/inactivo) y fecha de alta.
  - Modal para invitar/añadir nuevo miembro con formulario reactivo validado.
  - Modal o selector rápido para editar rol y número de socio.
  - Diálogos de confirmación centralizados con `ConfirmDialogService` (`@core`) para cambiar estados o eliminar membresías.
  - Mensajes de feedback mediante `NotificationService` (`@core`) y textos 100% internacionalizados en `es.json`.

## Criterios de Aceptación (CA)

1. **CA-1: Aislamiento Multi-Tenant Estricto:** Un administrador de un club solo puede ver, modificar o gestionar miembros pertenecientes a su propio `club_id`.
2. **CA-2: Control de Acceso por Roles (RBAC):** Solo usuarios con rol `OWNER` o `ADMIN` en el club pueden acceder al endpoint y a la sección de administración de miembros.
3. **CA-3: Integridad de Propiedad del Club:** El sistema debe impedir revocar o eliminar el rol `OWNER` al propietario principal o dejar al club sin ningún `OWNER`.
4. **CA-4: Consumo Tipado OpenAPI:** El cliente Angular consumirá las interfaces generadas por Orval en `@core`, sin tipos manuales duplicados.
5. **CA-5: Cumplimiento de Reglas UI (`AGENTS.md`):**
   - Uso de `pButton`, `pInputText`, `pSelect`/`pDropdown`, `pTable`, `pBadge`.
   - Uso obligatorio de `NotificationService` y `ConfirmDialogService` de `@core`.
   - Tokens de diseño semánticos SCSS sin valores hardcodeados ni `@media` manuales.
   - 100% de textos traducidos con `ngx-translate` en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
