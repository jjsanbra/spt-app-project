# Tasks: admin-facilities-pricing (Fase 3)

**Fecha:** 2026-10-20  
**Estado:** ✅ Completado (Listo para revisión y archivado)  

---

## 1. Backend (NestJS)

- [x] **BACK-01 (Módulo Facilities):**
  - [x] Crear DTOs: `CreateFacilityDto`, `UpdateFacilityDto`, `FacilityResponseDto` con validaciones de `class-validator` y decoradores Swagger.
  - [x] Implementar `FacilitiesService` con aislamiento multi-tenant por `club_id`.
  - [x] Implementar `FacilitiesController` con endpoints CRUD (`/api/v1/facilities`).
- [x] **BACK-02 (Módulo Facility Blocks):**
  - [x] Crear DTOs: `CreateFacilityBlockDto`, `FacilityBlockResponseDto`.
  - [x] Implementar `FacilityBlocksService` (validación de rango de horas y pertenencia a la pista).
  - [x] Implementar endpoints en `FacilitiesController` (`/api/v1/facilities/:id/blocks`).
- [x] **BACK-03 (Módulo Pricing):**
  - [x] Crear DTOs: `CreatePricingRuleDto`, `UpdatePricingRuleDto`, `PricingRuleResponseDto`.
  - [x] Implementar `PricingService` y `PricingController` (`/api/v1/pricing`).
- [x] **BACK-04 (Registro en AppModule y Guards):**
  - [x] Registrar módulos en `app.module.ts`.
  - [x] Proteger endpoints con `JwtAuthGuard` y comprobación de roles (`ADMIN`, `OWNER` o `SuperAdmin`).

---

## 2. Contratos y Clientes API (Orval & @core)

- [x] **API-01:** Regenerar clientes y modelos tipados con `npm run api:generate`.
- [x] **API-02:** Verificar exportaciones en `@core` para instalaciones, bloqueos y tarifas.

---

## 3. Frontend (`spt-admin`)

- [x] **FRONT-01 (Internacionalización):**
  - [x] Añadir claves completas bajo `"ADMIN.FACILITIES"` y `"ADMIN.PRICING"` en `src/assets/i18n/es.json` y carpetas `public/`.
- [x] **FRONT-02 (Gestión de Instalaciones):**
  - [x] Implementar `facilities-list.component.ts`, `.html`, `.scss` con `pTable`, `pButton`, `pTag`, `pDialog`, `pSelect`.
- [x] **FRONT-03 (Bloqueos de Instalación):**
  - [x] Implementar vista modal o componente `facility-blocks.component.ts`, `.html`, `.scss` para programar paradas técnicas/torneos.
- [x] **FRONT-04 (Configuración de Tarifas):**
  - [x] Implementar `pricing-list.component.ts`, `.html`, `.scss` con tabla de reglas de precios y formulario modal.
- [x] **FRONT-05 (Rutas de spt-admin y Navegación):**
  - [x] Configurar lazy routing en `apps/frontend/projects/spt-admin/src/app/app.routes.ts`.
  - [x] Enlazar accesos directos desde el Dashboard de administración.

---

## 4. Testing & Calidad

- [x] **TEST-01 (Backend Unit Tests):**
  - [x] Pruebas unitarias para `FacilitiesService` y `PricingService` con mocks de Prisma.
- [x] **TEST-02 (Frontend Unit Tests):**
  - [x] Pruebas unitarias para componentes de `spt-admin` usando mocks generados por Orval (`@core`).
- [x] **TEST-03 (Suite Completa):**
  - [x] Ejecución y validación de `npm test` al 100%.

---

## 5. Documentación y Sincronización

- [x] **DOC-01:** Ejecutar `npm run codegraph:sync`.
- [x] **DOC-02:** Archivar cambio con `node scripts/spec-archive.js admin-facilities-pricing` antes de preparar commit.
