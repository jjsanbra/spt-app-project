# Especificación Delta: Gestión de Miembros y Roles del Club

## 1. Reglas de Negocio

### RN-1: Aislamiento Multi-Tenant Estricto
Toda operación sobre un miembro (`listar`, `invitar`, `cambiar rol`, `desactivar`, `eliminar`) debe verificar que la membresía pertenezca al `club_id` especificado en la cabecera `x-tenant-id` y validado por el `TenantGuard`.

### RN-2: Protección del Propietario (OWNER)
- Un club debe tener siempre al menos un usuario con rol `OWNER`.
- Si se intenta revocar el rol `OWNER` de un usuario o eliminar su membresía, el sistema debe comprobar si es el único `OWNER` del club. Si lo es, la petición debe responder con un error `400 Bad Request` indicando que no se puede degradar ni eliminar al único propietario.

### RN-3: Roles Disponibles
Los roles permitidos para las membresías de club son los definidos en el enum `ClubRole` de Prisma:
- `OWNER`: Propietario del club con acceso total.
- `ADMIN`: Administrador con permisos de gestión de pistas, precios y miembros.
- `STAFF`: Personal del club con acceso a reservas y pagos presenciales.
- `MEMBER`: Socio o jugador registrado del club.

### RN-4: Invitación y Vinculación
- Al invitar a un usuario por email:
  - Si el usuario ya existe en el sistema general (`users`), se asocia al club creando un registro en `club_memberships` con el rol solicitado.
  - Si el usuario ya forma parte del club, se responde con un error `409 Conflict`.
  - Si el usuario no existe en la plataforma, se crea un registro de usuario provisional o se emite la invitación con estado pendiente.

---

## 2. Casos de Uso

### CU-1: Listar miembros del club
- **Actor:** Administrador (`OWNER` o `ADMIN`).
- **Precondición:** Autenticado con token JWT válido y cabecera `x-tenant-id`.
- **Flujo:**
  1. El cliente solicita `GET /api/v1/clubs/members`.
  2. El servidor filtra membresías por `club_id` e incluye los datos del usuario (`name`, `email`, `phone`, `avatarUrl`).
  3. Devuelve código HTTP `200 OK` con la lista de miembros ordenada por rol y fecha de creación.

### CU-2: Cambiar rol de un miembro
- **Actor:** Administrador (`OWNER` o `ADMIN`).
- **Flujo:**
  1. El cliente envía `PATCH /api/v1/clubs/members/:id/role` con `{ role: "ADMIN" }`.
  2. El servidor valida pertenencia al club y regla RN-2.
  3. Actualiza el rol y devuelve código HTTP `200 OK`.

### CU-3: Dar de baja una membresía
- **Actor:** Administrador (`OWNER` o `ADMIN`).
- **Flujo:**
  1. El cliente confirma la acción en la UI mediante `ConfirmDialogService`.
  2. El cliente envía `DELETE /api/v1/clubs/members/:id`.
  3. El servidor valida pertenencia y regla RN-2.
  4. Elimina la fila de `club_memberships` y devuelve código HTTP `200 OK`.
