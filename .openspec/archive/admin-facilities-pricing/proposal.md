# Proposal: admin-facilities-pricing (Fase 3)

**Fecha:** 2026-10-20  
**Estado:** ✅ Completado
**Archivado:** 2026-10-20  
**Autor:** Antigravity AI  

---

## 1. Contexto y Motivación

En la Fase 2 completamos el sistema de autenticación multi-tenant y perfiles de usuario. Sin embargo, para que los centros deportivos puedan operar y ofrecer reservas a los usuarios (Fase 4), es indispensable que los administradores de los clubes puedan:
1. **Configurar y gestionar su catálogo de instalaciones y pistas deportivas** (pádel cristal/muro, tenis tierra/rápida, fútbol césped, etc.) con sus características (indoor/outdoor, iluminación, capacidad de jugadores, duración de franjas).
2. **Definir bloqueos temporales de pistas** para mantenimientos, clases, entrenamientos o torneos, evitando reservas en esos periodos.
3. **Establecer reglas de tarificación flexibles**, discriminando entre tarifas valle/punta, precios para socios vs invitados y recargos por iluminación artificial.

Actualmente, el microfrontend `spt-admin` solo cuenta con una vista resumen estática en el Dashboard. Es necesario dotarlo de los módulos de gestión completos comunicados con la API de NestJS.

---

## 2. Solución Propuesta

Implementar la arquitectura completa para la gestión del club e instalaciones:

### Backend (NestJS):
- **Módulo `facilities`**:
  - `GET /api/v1/facilities`: Listado de instalaciones del club activo (con filtros por deporte y estado).
  - `GET /api/v1/facilities/:id`: Detalle de una instalación.
  - `POST /api/v1/facilities`: Alta de nueva pista deportiva.
  - `PUT /api/v1/facilities/:id`: Modificación de instalación.
  - `DELETE /api/v1/facilities/:id`: Desactivación/borrado lógico de instalación.
- **Módulo `facility-blocks`**:
  - `GET /api/v1/facilities/:id/blocks`: Listado de bloqueos activos y futuros.
  - `POST /api/v1/facilities/:id/blocks`: Creación de un bloqueo temporal.
  - `DELETE /api/v1/facilities/:id/blocks/:blockId`: Levantamiento de bloqueo.
- **Módulo `pricing`**:
  - `GET /api/v1/pricing`: Listado de reglas de tarifas activas del club.
  - `POST /api/v1/pricing`: Creación de regla tarifaria (horarios valle/punta, precios socio/invitado, días de la semana, suplemento luz).
  - `PUT /api/v1/pricing/:id`: Modificación de regla.
  - `DELETE /api/v1/pricing/:id`: Eliminación de regla tarifaria.
- **Seguridad y Multi-tenancy**:
  - Validación del header `x-tenant-id` o membresía del usuario administrador mediante `ClubMemberGuard` y `RolesGuard` (`ADMIN` o `OWNER`, o `SuperAdmin`).

### Frontend (`spt-admin`):
- **Vistas con PrimeNG y Design System Oficial**:
  - **Gestión de Instalaciones (`/admin/facilities`)**:
    - Tabla interactiva con `p-table` (`pTable`), filtros por deporte y badges de estado (`p-tag`).
    - Modal de creación/edición con `p-dialog`, inputs con directiva `pInputText`, `p-dropdown` para deporte/superficie/tipo y `p-inputnumber`.
  - **Bloqueos de Pistas (`/admin/facilities/:id/blocks`)**:
    - Listado de bloqueos vigentes y formulario para programar nuevos bloqueos con rango de fechas y horas (`p-calendar` / `p-datepicker`).
  - **Configuración de Tarifas (`/admin/pricing`)**:
    - Tabla visual de reglas de precios (días de semana, horas punta/valle, precios y suplementos).
    - Modal de creación/edición de reglas tarifarias.
- **Sincronización Orval (`@core`)**:
  - Regeneración de servicios y DTOs con `npm run api:generate` para consumo tipado en Angular.
- **Internacionalización total (`ngx-translate`)**:
  - Claves centralizadas en `es.json` bajo el nodo `"ADMIN"`. Cero textos hardcodeados.

---

## 3. Criterios de Aceptación (CA)

- [ ] **CA-01 (Aislamiento Multi-tenant):** Ningún usuario de un club puede visualizar, crear o modificar instalaciones o tarifas de otro centro deportivo.
- [ ] **CA-02 (CRUD de Instalaciones):** El administrador puede listar, crear, editar y desactivar pistas deportivas asignando deporte, superficie, cubierta y duración de franja.
- [ ] **CA-03 (Bloqueos Temporales):** El administrador puede bloquear una pista en un rango horario con un motivo explicativo, validando que la fecha fin sea posterior a la de inicio.
- [ ] **CA-04 (Motor de Tarifas):** El administrador puede configurar tarifas por días de la semana y rango horario, especificando precio socio, precio invitado y suplemento de luz.
- [ ] **CA-05 (UI y PrimeNG):** Todas las acciones utilizan directivas PrimeNG (`pButton`, `pInputText`, etc.), encapsulamiento SCSS con tokens de diseño y mixins responsivos (`@include mobile`).
- [ ] **CA-06 (Internacionalización):** El 100% de los literales se resuelven mediante `ngx-translate`.
- [ ] **CA-07 (Cobertura de Tests):** Tests unitarios con Jest en backend y Vitest en frontend utilizando mocks generados por Orval (`@core`).

---

## 4. Impacto Estimado

- **Backend:** Nuevos módulos `facilities` y `pricing` en `apps/backend/src/`.
- **Frontend:** Nuevas páginas y componentes en `apps/frontend/projects/spt-admin/src/app/pages/`.
- **Base de Datos:** Sin cambios destructivos ni modificaciones de esquema; los modelos `Facility`, `FacilityBlock` y `PricingRule` ya existen en `schema.prisma`.
- **Riesgo:** 🟢 **Bajo** (No altera estructuras existentes ni requiere migraciones de datos).

---

## 5. Dependencias

- **Fase 1 (Modelado de Dominio):** ✅ Completada (Modelos de Prisma creados).
- **Fase 2 (Autenticación JWT):** ✅ Completada (Roles y tokens disponibles).
