# Delta de Especificación: Gestión Global de Bloqueos por Pista y Deporte

## 1. Reglas de Negocio

### RN-BLK-01: Ámbito del Bloqueo Temporal
- Todo bloqueo temporal de pista (`FacilityBlock`) persiste en base de datos vinculado obligatoriamente a una instalación concreta (`facilityId`) y a un club (`clubId`).
- Si el usuario selecciona "Todas las pistas de [Deporte]", el sistema resuelve automáticamente todas las pistas pertenecientes a dicho deporte dentro del club actual y genera un registro independiente de `FacilityBlock` para cada una de ellas de forma atómica.

### RN-BLK-02: Filtros y Visualización Global
- El panel de administración de bloqueos permite consultar todos los bloqueos del club de manera centralizada.
- Permite filtrar por:
  1. **Deporte:** Filtrar por `PADEL`, `TENNIS`, `PICKLEBALL` o `TODOS`.
  2. **Pista:** Filtrar por una pista específica dentro del deporte seleccionado o ver `TODAS`.
- La tabla debe identificar visualmente a qué deporte y a qué pista pertenece cada bloqueo.

### RN-BLK-03: Restricciones Horarias y Validación
- `startTime` debe ser estrictamente anterior a `endTime`.
- No se permiten bloqueos en el pasado salvo consulta histórica.
- Si una pista ya tiene un bloqueo o una reserva existente, la creación del bloqueo debe advertir o gestionar el solapamiento según las reglas del club.

### RN-BLK-04: Seguridad y Multi-Tenant
- Solo los roles de gestión (`ADMIN` y `OWNER`) pueden consultar, crear o eliminar bloqueos.
- No se permite asociar un bloqueo a pistas pertenecientes a otro club. Si un payload contiene identificadores de pista ajenos al club autenticado, la petición debe rechazarse íntegramente con error `400 Bad Request`.

---

## 2. Casos de Uso

### UC-1: Consultar Bloqueos Globales del Club
**Actor:** Administrador / Propietario de Club.  
**Flujo Principal:**
1. El usuario accede a la sección de Bloqueos de Instalaciones (`/admin/facilities/blocks`).
2. El sistema recupera y muestra el listado completo de bloqueos vigentes en el club.
3. El usuario observa para cada registro: el badge del deporte, el nombre de la pista, el título del bloqueo, el rango de fechas y la acción de eliminar.

### UC-2: Programar Bloqueo para una Pista Concreta
**Actor:** Administrador / Propietario de Club.  
**Flujo Principal:**
1. El usuario pulsa en "Programar Bloqueo".
2. Selecciona el deporte (ej: Pádel) y la modalidad "Pista específica", eligiendo "Pista 3 Central".
3. Rellena título ("Reparación de foco"), fechas y motivo opcional.
4. Pulsa "Guardar Bloqueo".
5. El sistema persiste el bloqueo para dicha pista y actualiza el listado.

### UC-3: Programar Bloqueo Masivo por Deporte (Torneo o Climatología)
**Actor:** Administrador / Propietario de Club.  
**Flujo Principal:**
1. El usuario pulsa en "Programar Bloqueo".
2. Selecciona el deporte (ej: Tenis) y la modalidad "Todas las pistas de este deporte".
3. Rellena título ("Lluvia intensa - Pistas no transitables") y el rango horario afectado.
4. Pulsa "Guardar Bloqueo".
5. El sistema crea un bloqueo para cada una de las pistas de Tenis del club en una única transacción atómica.
6. El sistema muestra mensaje de confirmación notificando el número de pistas bloqueadas.
