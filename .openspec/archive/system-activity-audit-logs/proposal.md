# Proposal: system-activity-audit-logs

**Fecha:** 2026-10-26
**Estado:** ✅ Completado
**Archivado:** 2026-10-26 (Alineado con Usuario)
**Autor:** Antigravity AI & Equipo de Arquitectura SPT

---

## 1. Contexto y Motivación

Actualmente, `spt-app-project` es un sistema SaaS multi-tenant donde conviven múltiples clubes deportivos con miles de operaciones diarias: reservas de pistas, bloqueos por mantenimiento, ajustes de tarifas, altas/bajas de socios, recargas de monedero y cancelaciones.

A medida que los clubes crecen y cuentan con personal de recepción, administradores y múltiples usuarios:
- No existe un **registro histórico de auditoría** centralizado para rastrear *quién hizo qué, cuándo y sobre qué recurso*.
- Ante disputas operativas (ej: una reserva cancelada por error, una tarifa modificada inesperadamente, un bloqueo de pista creado o un saldo ajustado manualmente), los administradores del club y el SuperAdmin carecen de visibilidad forense y trazabilidad clara.
- Asimismo, **los propios usuarios y socios necesitan transparencia** para consultar el histórico de sus propias actividades (sus reservas realizadas o canceladas, recargas o consumos de monedero y accesos a su cuenta).
- Es necesario un **sistema de log de actividades y auditoría (Activity & Audit Logs)** que garantice transparencia, cumplimiento normativo, seguridad y facilidad de resolución de incidencias, tanto para administradores como para los usuarios finales.

---

## 2. Solución Propuesta

Implementar una infraestructura transversal de **Log de Actividades del Sistema (Audit Trail)** compuesta por:

1. **Modelo de Datos Multi-tenant (`ActivityLog`)**:
   - Persistencia estructurada con aislamiento estricto por `club_id` (y soporte para eventos globales de plataforma por SuperAdmin con `club_id = null`).
   - Trazabilidad de: usuario ejecutor (`user_id`), tipo de acción (`action`), categoría/entidad (`entity_type`), identificador del recurso (`entity_id`), resumen legible (`summary`), metadata JSON (`metadata` con snapshot y diffs de cambio), dirección IP y agente de usuario.
   - Indexación optimizada (`[club_id, created_at]`, `[club_id, entity_type, entity_id]`, `[user_id, created_at]`) para consultas ultra-rápidas con paginación.

2. **Módulo de Auditoría en Backend (NestJS)**:
   - `ActivityLogsService`: servicio desacoplado y asíncrono (*fire-and-forget* con captura interna de fallos para no interrumpir ni abortar transacciones de negocio).
   - Inyección directa en puntos clave de mutación (`BookingsService`, `FacilitiesService`, `PricingService`, `ClubsMembersService`, `AuthService`).
   - Endpoint administrativo con RBAC (`GET /api/v1/clubs/:clubId/activity-logs`) para roles `OWNER`, `ADMIN` y `SUPER_ADMIN`.
   - Endpoint de usuario autenticado (`GET /api/v1/users/me/activity-logs`) para que cualquier usuario consulte únicamente sus propias acciones filtradas por el club activo.
   - Endpoint para SuperAdmin (`GET /api/v1/superadmin/activity-logs`) para auditoría global de clubes y operaciones de plataforma.

3. **Interfaz de Usuario en Frontend**:
   - **Panel de Administración (`spt-admin`):** Vista **"Registro de Actividad"** (`/admin/activity-logs`) con tabla PrimeNG (`p-table`), filtros por rango de fechas, categorías, buscador, modal de detalle/diffs y exportación a **CSV**.
   - **Portal de Usuario (`spt-portal`):** Vista **"Mi Actividad"** (`/portal/activity`) donde el socio visualiza de forma limpia y transparente su historial de reservas, pagos/monedero y accesos.

---

## 3. Criterios de Aceptación (CA)

- [ ] **CA-01 (Multi-Tenancy y Seguridad Administrativa):** Los administradores de un club solo pueden visualizar los logs asociados a su propio `club_id`. Solo usuarios con rol `OWNER`, `ADMIN` del club o `SUPER_ADMIN` tienen acceso a la consulta administrativa de logs del club.
- [ ] **CA-02 (Vista "Mi Actividad" para Usuarios):** Cualquier usuario autenticado puede consultar su propio histórico de actividad a través de `GET /api/v1/users/me/activity-logs`. Bajo ninguna circunstancia un usuario estándar podrá visualizar actividades pertenecientes a otros usuarios.
- [ ] **CA-03 (Trazabilidad Completa):** Se registran de forma automática e inalterable todas las categorías clave:
  - **Reservas:** Creación, cancelación (con motivo), check-in / completado.
  - **Instalaciones:** Alta de pista, edición, eliminación lógica, creación y eliminación de bloqueos/mantenimientos.
  - **Tarifas:** Creación, actualización de precios y eliminación de reglas tarifarias.
  - **Miembros:** Asignación de rol, cambios de membresía, recargas manuales o ajustes de monedero.
  - **Autenticación:** Inicios de sesión de cuentas y cambios de credenciales.
  - **Plataforma:** Acciones de SuperAdmin sobre clubes.
- [ ] **CA-04 (No Bloqueo de Transacciones):** Un eventual error al escribir un registro de auditoría nunca debe provocar el fallo de la operación de negocio del usuario. El guardado debe ser resiliente y asíncrono.
- [ ] **CA-05 (Paginación y Filtros Eficientes):** La API y las vistas deben permitir filtrar por rango de fechas (desde/hasta), categoría/entidad, tipo de acción y usuario ejecutor, devolviendo resultados paginados.
- [ ] **CA-06 (Detalle Forense y Diffs):** El registro debe almacenar en el campo `metadata` los valores relevantes y, cuando proceda, el diferencial (campos modificados: valor previo vs valor nuevo).
- [ ] **CA-07 (Exportación CSV):** Los administradores deben poder exportar los registros de auditoría filtrados a un archivo CSV.

---

## 4. Impacto Estimado

- **Backend:** 🟢 Bajo-Medio. Nuevo módulo `ActivityLogsModule`, controlador, DTOs y llamadas de logging en servicios mutadores existentes.
- **Frontend Admin (`spt-admin`):** 🟢 Medio. Nueva página `ActivityLogsComponent`, ruta en router, traducciones i18n y llamadas tipadas de Orval.
- **Frontend Portal (`spt-portal`):** 🟢 Medio. Nueva página `UserActivityComponent`, enlace en navegación y componentes PrimeNG.
- **Base de datos:** 🟢 Seguro y Aditivo. Nueva tabla `activity_logs` en PostgreSQL sin tocar tablas existentes ni restricciones destructivas.
- **Riesgo:** 🟢 Bajo.

---

## 5. Dependencias

- Modelo relacional existente de `Club` y `User`.
- Componentes de PrimeNG instalados (`p-table`, `p-select`, `p-datepicker`, `p-tag`, `p-dialog`, `p-button`).
