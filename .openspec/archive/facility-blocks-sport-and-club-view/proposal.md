# Propuesta: Gestión Global de Bloqueos por Pista y Deporte

## 1. Contexto y Problema de Negocio

En la gestión operativa de un centro deportivo, los bloqueos temporales de disponibilidad son esenciales para coordinar mantenimientos (rotura de cristales, cambio de redes, revisión de iluminación), climatología adversa (lluvia en pistas exteriores de tenis/pádel) o eventos especiales (torneos, clinics, clases magistrales).

Actualmente, la entidad `FacilityBlock` en base de datos ya está vinculada a una pista individual (`facility_id`), pero la experiencia de usuario y los endpoints presentan importantes limitaciones:
1. **Percepción de "bloqueo genérico" o "ciego":** Al entrar a `/admin/facilities/blocks` desde el menú lateral, la interfaz selecciona automáticamente la primera pista de la lista sin que el usuario sea plenamente consciente.
2. **Modal sin contexto de pista ni deporte:** El formulario de creación no permite elegir pista ni deporte, asumiendo implícitamente la pista activa en el filtro superior.
3. **Imposibilidad de bloqueos masivos por deporte:** Si un administrador necesita bloquear todas las pistas de pádel por un torneo de fin de semana o por lluvia en pistas exteriores, debe repetir manualmente el proceso pista por pista tantas veces como pistas tenga el club.
4. **Falta de vista global:** No existe un listado unificado donde el administrador pueda ver de un vistazo todos los bloqueos programados en el club, filtrando ágilmente por deporte o por instalación.

---

## 2. Solución Propuesta

Implementar una gestión global y flexible de bloqueos temporales de instalaciones en backend y frontend:

### 2.1 Backend (NestJS + Prisma)
1. **Listado global de bloqueos del club:**
   - Crear endpoint `GET /facilities/blocks` (o query param global) accesible por administradores del club (`ADMIN`, `OWNER`), con soporte para filtros opcionales por `sportType` y `facilityId`.
   - Enriquecer la respuesta para incluir los datos esenciales de la pista (`facilityName`, `sportType`) sin necesidad de consultas N+1 en el cliente.
2. **Creación en lote / masiva (Bulk Create):**
   - Crear endpoint `POST /facilities/blocks/bulk` que reciba un payload con `facilityIds: string[]` (o resolución por `sportType`), `title`, `reason`, `startTime` y `endTime`.
   - Ejecutar la creación de forma atómica dentro de una transacción `$transaction` de Prisma, respetando las validaciones de fechas (`startTime < endTime`) y el aislamiento multi-tenant estricto (`clubId`).

### 2.2 Frontend (spt-admin + @core)
1. **Actualización de clientes con Orval (`npm run api:generate`).**
2. **Rediseño de la pantalla de Bloqueos (`facility-blocks.component`):**
   - **Vista unificada del club:** Visualización de todos los bloqueos vigentes del club en una sola tabla de PrimeNG.
   - **Filtros en cabecera:** Filtro por Deporte (Todos, Pádel, Tenis, etc.) y por Pista específica.
   - **Columnas informativas:** Deporte (Tag/Badge temático), Pista, Título, Motivo, Fechas y acciones.
3. **Modal de creación enriquecido:**
   - Selector de **Deporte** (`SportType`).
   - Selector de **Ámbito / Destino**:
     - *Opción A:* "Pista específica" (desplegable con las pistas del deporte seleccionado).
     - *Opción B:* "Todas las pistas de este deporte" (aplica en bloque a todas las pistas que compartan el deporte).
     - *Opción C:* "Selección múltiple de pistas" (checkboxes/multiselect).
   - Validaciones reactivas y feedback claro mediante `NotificationService`.

---

## 3. Criterios de Aceptación (CA)

- **CA-1 (Listado Global):** Un administrador que navega a `/admin/facilities/blocks` visualiza de forma predeterminada todos los bloqueos del club, con indicación explícita del deporte y la pista correspondiente.
- **CA-2 (Filtrado Ágil):** El administrador puede filtrar el listado por deporte y/o por pista específica mediante componentes oficiales de PrimeNG (`p-select`).
- **CA-3 (Bloqueo a Pista Individual):** El administrador puede programar un bloqueo seleccionando una pista concreta desde el modal, guardándose en base de datos asociado a dicha pista.
- **CA-4 (Bloqueo Masivo por Deporte / Multiselección):** El administrador puede programar un bloqueo seleccionando "Todas las pistas de [Deporte]" o múltiples pistas a la vez. El sistema crea los registros correspondientes para cada pista en una única operación atómica.
- **CA-5 (Eliminación Segura):** El administrador puede cancelar/eliminar cualquier bloqueo individual con diálogo de confirmación centralizado (`ConfirmDialogService`).
- **CA-6 (Aislamiento Multi-tenant):** Ningún bloqueo ni pista de otro club puede ser listado, creado ni eliminado.
- **CA-7 (Compatibilidad de Rutas):** La ruta con parámetro `/admin/facilities/:id/blocks` sigue funcionando, prefiltrando la vista para la pista indicada.
