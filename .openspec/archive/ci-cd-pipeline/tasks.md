# Tareas: Automatización CI/CD con GitHub Actions (`ci-cd-pipeline`)

## Fase 1: Herramientas de Calidad y Validación Local
- [x] 1.1 Configurar `apps/backend/.eslintrc.js` para NestJS y TypeScript
- [x] 1.2 Implementar script de validación OpenSpec en `scripts/validate-specs.js`
- [x] 1.3 Validar ejecución local de `npm run lint` y `npm run spec:check`

## Fase 2: Configuración del Pipeline de GitHub Actions
- [x] 2.1 Crear directorio `.github/workflows/`
- [x] 2.2 Diseñar y escribir `.github/workflows/ci.yml` con jobs para lint/specs, backend y frontend
- [x] 2.3 Probar sintaxis y validación estática del workflow

## Fase 3: Verificación y Sincronización
- [x] 3.1 Ejecutar `npm run test` (backend y frontend completos)
- [x] 3.2 Ejecutar `npm run build:all` y `npm run build:backend`
- [x] 3.3 Sincronizar CodeGraph con `npm run codegraph:sync`
