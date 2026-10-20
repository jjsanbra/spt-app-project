# Proposal: project-scaffold

**Fecha:** 2026-10-20
**Estado:** ✅ Completado
**Archivado:** 2026-10-20
**Autor:** Antigravity AI

---

## 1. Contexto y Motivación

Scaffolding inicial del proyecto SaaS Multi-tenant SPT App, incluyendo monorepo npm workspaces, microfrontends de Angular con Native Federation y API REST en NestJS.

## 2. Solución Propuesta

Configuración integral del entorno de desarrollo:
- Backend NestJS con Prisma ORM, Swagger, autenticación JWT y roles.
- Frontend Angular con arquitectura de microfrontends (Shell host, spt-admin, spt-portal, spt-users).
- Design System transversal con tokens semánticos, mixins responsivos y componentes PrimeNG.
- Generación automática de contratos OpenAPI con Orval hacia `@core`.

## 3. Criterios de Aceptación

- [x] CA-01: Monorepo operativo con scripts de desarrollo concurrently.
- [x] CA-02: Microfrontends federados mediante Native Federation comunicados con el Shell.
- [x] CA-03: Suite de pruebas unitarias configurada y ejecutándose en verde con Vitest y mocks de Orval.

## 4. Impacto Estimado

- **Backend:** Setup inicial con NestJS y Prisma.
- **Frontend:** Shell host y 3 microfrontends remotos.
- **Base de datos:** Contenedor PostgreSQL en puerto 5433 con semillas de prueba.
- **Riesgo:** 🟢 Bajo

## 5. Dependencias

- Ninguna (Fase inicial de scaffolding).
