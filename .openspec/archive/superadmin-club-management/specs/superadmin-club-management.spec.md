# Especificación Funcional: Gestión SuperAdmin de Clubes

## 1. Visión General
Esta especificación define el comportamiento funcional y las reglas de negocio para el módulo de Superadministración de centros deportivos (alta, consulta, modificación y activación/desactivación de inquilinos).

## 2. Reglas de Negocio

### RN-SAC-01: Privilegios de Superadministrador
- Solo aquellos usuarios cuyo registro en la tabla `users` posea `is_super_admin = true` están autorizados para acceder a las operaciones de este módulo.
- Cualquier solicitud a endpoints `/api/v1/superadmin/*` por parte de usuarios no autenticados debe responder `401 Unauthorized`.
- Cualquier solicitud por parte de usuarios autenticados sin privilegios de SuperAdmin debe responder `403 Forbidden`.

### RN-SAC-02: Unicidad y Formato del Slug
- El `slug` del club actúa como identificador legible en URLs y subdominios.
- Debe estar compuesto únicamente por caracteres alfanuméricos en minúsculas y guiones (ej: `madrid-central-padel`).
- No pueden existir dos clubes con el mismo `slug`. Si se intenta crear o actualizar un club con un slug ya existente, el sistema debe retornar `409 Conflict`.

### RN-SAC-03: Horarios de Operación
- `openingHour` debe estar entre 0 y 23.
- `closingHour` debe estar entre 1 y 24.
- `openingHour` debe ser estrictamente menor que `closingHour`. En caso contrario, se rechazará con `400 Bad Request`.

### RN-SAC-04: Asignación de Propietario Inicial (`OWNER`)
- Al registrar un club, si se proporciona el parámetro opcional `ownerEmail`:
  - Si el usuario existe en la plataforma, se crea una membresía `ClubMembership` para dicho usuario en el nuevo club con `role = OWNER` y `status = ACTIVE`.
  - Si no se proporciona `ownerEmail`, el club se crea sin propietario asignado, permitiendo asignarlo posteriormente desde el módulo de miembros.

### RN-SAC-05: Desactivación de un Club
- Al desactivar un club (`isActive = false`):
  - El club deja de aparecer en los selectores de clubes públicos del portal de usuarios.
  - No se permiten nuevas reservas para pistas pertenecientes a ese club.
  - Los socios activos conservan sus datos para cuando el club sea reactivado.

## 3. Casos de Uso

### CU-SAC-01: Listar Directorio Global de Clubes
- **Actor:** SuperAdmin.
- **Precondición:** Sesión iniciada con privilegios globales.
- **Flujo Principal:**
  1. El actor accede a la sección de SuperAdmin de Clubes.
  2. El sistema recupera la lista de clubes junto con el conteo de pistas activas y número de miembros registrados.
  3. El sistema muestra la tabla ordenada alfabéticamente por nombre de club.
  4. El actor puede filtrar por texto (nombre, slug o ciudad) o por estado (activo/inactivo).

### CU-SAC-02: Dar de Alta un Nuevo Centro Deportivo
- **Actor:** SuperAdmin.
- **Flujo Principal:**
  1. El actor pulsa el botón "+ Nuevo Club".
  2. Se abre un diálogo modal con los campos del centro deportivo:
     - Nombre del club (obligatorio)
     - Slug único (obligatorio, autogenerado a partir del nombre con posibilidad de edición)
     - Email de contacto (obligatorio)
     - Teléfono, Dirección, Ciudad, Código Postal (opcionales)
     - Horario de apertura y cierre (por defecto 8 a 23)
     - Duración de franja (por defecto 60 min)
     - Modalidad de cobro (Presencial, Online o Híbrida)
     - Email del propietario inicial (opcional)
  3. El actor confirma el formulario.
  4. El sistema valida los datos y registra la entidad `Club` y la membresía correspondiente en una transacción.
  5. El sistema cierra el modal, refresca la tabla y notifica el éxito mediante un Toast verde.
