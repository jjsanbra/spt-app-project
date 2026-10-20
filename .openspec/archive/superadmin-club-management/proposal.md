# Propuesta: Módulo SuperAdmin para Alta y Gestión de Clubes (`superadmin-club-management`)

## 1. Contexto y Problema de Negocio
`spt-app-project` es una plataforma SaaS deportiva multi-tenant diseñada para dar servicio a múltiples centros deportivos simultáneamente. Cada club opera como un inquilino (*tenant*) aislado con sus propias instalaciones, pistas, reglas de precios, reservas y socios.

Actualmente:
- El panel de administración (`spt-admin`) está concebido exclusivamente como **Tenant Admin** (administrador local de un club específico mediante la cabecera `x-tenant-id`).
- No existe una interfaz ni endpoints en la API para que los administradores globales de la plataforma (**SuperAdmin**) puedan dar de alta nuevos centros deportivos, visualizar el directorio global de inquilinos, supervisar su estado o activar/desactivar clubes de forma centralizada sin requerir acceso directo a la consola de base de datos o scripts de `seed`.

## 2. Solución Propuesta
Desarrollar un módulo integral de **SuperAdmin (Backoffice Global de Plataforma)** que permita a los usuarios con privilegios globales (`isSuperAdmin = true`) gestionar el ciclo de vida completo de los centros deportivos:

1. **Control de Acceso y Seguridad Backend:**
   - Crear el decorador y guard `SuperAdminGuard` que valide de manera estricta que `user.isSuperAdmin === true` en el token JWT.
   - Endpoints REST en `apps/backend` bajo `/api/v1/superadmin/clubs` libres de la restricción de `x-tenant-id` local.
2. **Endpoints de Plataforma:**
   - `GET /api/v1/superadmin/clubs`: Listar todos los clubes de la plataforma con filtros por estado y conteos agregados (número de instalaciones y socios).
   - `POST /api/v1/superadmin/clubs`: Crear un nuevo club (nombre, slug único, datos de contacto, horarios y modo de pago) y asignar/vincular opcionalmente al `OWNER` inicial.
   - `GET /api/v1/superadmin/clubs/:id`: Detalle y estadísticas del club.
   - `PATCH /api/v1/superadmin/clubs/:id`: Actualizar configuración o alternar estado (`isActive`).
3. **Interfaz de Usuario en `spt-admin`:**
   - Nueva ruta protegida `/admin/superadmin/clubs`.
   - Visibilidad condicional en el menú/navbar para usuarios con `isSuperAdmin`.
   - Tabla interactiva PrimeNG (`p-table`) con paginación, filtros y badge de estado.
   - Modal interactivo PrimeNG (`p-dialog`) con formulario reactivo validado para el alta de nuevo centro deportivo.
   - Notificaciones y confirmaciones globales mediante `@core`.

## 3. Criterios de Aceptación (CA)
- [ ] **CA-1: Autorización Estricta:** Solo usuarios con `isSuperAdmin === true` pueden consultar o invocar endpoints de `/api/v1/superadmin/*` (devolver `403 Forbidden` para usuarios regulares o administradores de club).
- [ ] **CA-2: Creación de Club y Slug Único:** La API debe validar que el `slug` sea alfanumérico, normalizado y único globalmente.
- [ ] **CA-3: Asignación de Propietario Inicial:** Al dar de alta un club con un `ownerEmail`, si el usuario existe se le crea la membresía `ClubMembership` con rol `OWNER`; si no existe, se genera el registro inicial para que pueda acceder.
- [ ] **CA-4: Visualización Global en Admin:** Los superadministradores pueden ver la tabla de todos los clubes registrados en la plataforma, con su slug, ciudad, modalidad de pago, total de pistas y estado activo.
- [ ] **CA-5: Cambio de Estado:** Posibilidad de pausar o reactivar un club (`isActive`) con confirmación centralizada (`ConfirmDialogService`).
- [ ] **CA-6: Calidad e Internacionalización:** 100% de literales en `es.json`, diseño basado en tokens SCSS de `_variables.scss`, directivas de PrimeNG (`pButton`, `pInputText`, `pTable`, etc.) y tests en verde.
