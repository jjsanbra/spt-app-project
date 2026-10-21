# Especificación Funcional: Automatización CI/CD (`ci-cd-pipeline`)

## Requerimientos

### R-CI-01: Disparador del Pipeline
- El pipeline debe ejecutarse automáticamente ante eventos `push` a la rama `main` y en la creación o actualización de cualquier `pull_request` contra `main`.

### R-CI-02: Validación Estática y Linter
- El backend debe poseer configuración válida de ESLint (`apps/backend/.eslintrc.js`) que analice archivos `.ts` sin arrojar excepciones de configuración faltante.
- Las especificaciones OpenSpec deben ser auditadas mediante `npm run spec:check` para verificar que cada cambio en `.openspec/changes` cuente con `proposal.md`, `design.md`, `tasks.md` y su directorio `specs/`.

### R-CI-03: Automatización de Pruebas Unitarias
- El job de backend debe compilar el esquema de Prisma (`npx prisma generate`) y ejecutar la totalidad de los tests unitarios con Jest (`npm run test:backend`).
- El job de frontend debe ejecutar las suites de pruebas unitarias de los 4 microfrontends (`npm run test:frontend`).

### R-CI-04: Verificación de Artefactos de Producción (Builds)
- Debe validarse la generación de los paquetes de producción de los 4 microfrontends (`spt-admin`, `spt-portal`, `spt-users`, `spt-app`) mediante `npm run build:all`.
- Debe validarse la compilación de producción del backend NestJS mediante `npm run build:backend`.
