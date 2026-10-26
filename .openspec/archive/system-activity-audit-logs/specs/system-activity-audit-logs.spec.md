# Spec: system-activity-audit-logs

## 1. Descripción Funcional

El sistema debe proveer una pista de auditoría inmutable que capture las acciones relevantes realizadas por los usuarios y administradores en la plataforma:
- Los administradores de los clubes y superadministradores podrán consultar, filtrar, inspeccionar en detalle y exportar a CSV todos los eventos de su centro deportivo o de la plataforma.
- Los usuarios y socios autenticados podrán consultar de forma transparente el historial de sus propias actividades ("Mi Actividad") dentro del portal.

---

## 2. Reglas de Negocio

### RN-01: Aislamiento Estricto por Club
- Cada evento generado en el ámbito de un centro deportivo debe quedar asociado de forma inequívoca al `club_id`.
- Un administrador solo puede consultar registros cuyo `club_id` coincida con el club activo en su sesión.
- Solamente el rol `SUPER_ADMIN` tiene visibilidad para consultar registros sin filtro de club o a través de múltiples clubes.

### RN-02: Aislamiento Estricto por Usuario en "Mi Actividad"
- Cuando un usuario consulta sus actividades a través de `GET /api/v1/users/me/activity-logs`, el backend restringe de forma inviolable la consulta a `userId = req.user.id`.
- Un socio estándar nunca podrá acceder ni inferir actividades de otros usuarios ni cambios administrativos internos del club que no le conciernan directamente.

### RN-03: Inmutabilidad de los Registros
- Los registros de auditoría no pueden ser editados ni eliminados a través de la API pública o endpoints de administración. No existe operación `UPDATE` ni `DELETE` expuesta en los controladores.

### RN-04: Resiliencia Transaccional (No Bloqueante)
- La ejecución del registro de auditoría debe ser asíncrona respecto al flujo de la petición principal. Si ocurre un fallo en la persistencia del log, la operación de negocio del usuario (ej: reserva o cancelación) debe completarse exitosamente y el fallo de log debe ser registrado en el Logger de la aplicación.

### RN-05: Captura de Usuario y Anonimización Defensiva
- Todo registro debe guardar el `user_id` del actor que ejecutó la acción.
- En caso de eliminación posterior del usuario en la base de datos, el registro de auditoría conservará `user_id = null`, pero mantendrá en `metadata` el nombre y email del usuario para efectos de auditoría histórica.

### RN-06: Paginación y Límites de Consulta
- Las consultas deben estar paginadas por defecto con un límite predeterminado de 20 elementos y un máximo de 100 por petición.
- El orden por defecto es temporal descendente (`created_at DESC`).

---

## 3. Casos de Uso

### CU-01: Registro Automático al Cancelar una Reserva
- **Actor:** Administrador o Usuario organizador.
- **Flujo:**
  1. El usuario cancela una reserva especificando un motivo.
  2. El sistema actualiza el estado de la reserva a `CANCELLED`.
  3. El sistema emite un evento de auditoría con acción `BOOKING_CANCELLED`, guardando en `metadata` el motivo de cancelación, el precio previo y la pista afectada.
  4. La respuesta 200 OK se retorna al cliente.

### CU-02: Consulta y Filtrado de Logs en el Panel de Administración
- **Actor:** Administrador del Club (`OWNER` o `ADMIN`).
- **Flujo:**
  1. El administrador accede a la sección "Registro de Actividad" en `spt-admin`.
  2. La vista solicita a la API los últimos 20 registros para el club activo.
  3. El administrador selecciona un rango de fechas y la categoría "Instalaciones".
  4. La tabla actualiza de forma reactiva los resultados mostrando solo las acciones de creación, modificación o bloqueo de pistas.

### CU-03: Inspección de Detalle y Cambios (Diff)
- **Actor:** Administrador del Club.
- **Flujo:**
  1. En la tabla de registros, el administrador hace clic en el icono de inspección (ojo).
  2. Se abre un diálogo modal de PrimeNG que visualiza:
     - Actor y datos de conexión (IP, navegador).
     - Resumen legible del evento.
     - Detalle de los campos alterados (valor anterior vs. valor nuevo).
     - Payload JSON estructurado con opción de copiar.

### CU-04: Exportación de Auditoría a CSV
- **Actor:** Administrador del Club.
- **Flujo:**
  1. En el panel de auditoría, el administrador aplica los filtros deseados (ej. rango del último mes).
  2. Pulsa sobre el botón "Exportar CSV".
  3. El sistema genera y descarga de forma inmediata un archivo CSV delimitado por comas con las columnas clave del registro de auditoría.

### CU-05: Consulta de "Mi Actividad" por parte de un Socio
- **Actor:** Usuario/Socio en `spt-portal`.
- **Flujo:**
  1. El usuario navega a la sección "Mi Actividad" en el portal.
  2. La vista consume el endpoint `GET /api/v1/users/me/activity-logs`.
  3. El socio visualiza una lista temporal de sus propias reservas creadas/canceladas, recargas y consumos de monedero.
