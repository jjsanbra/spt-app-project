# Propuesta: Git Hook Pre-push con Husky y Verificación de Cobertura en Código Nuevo

## Contexto
El proyecto cuenta con un pipeline de CI en GitHub Actions que valida pruebas y compilación en la nube. Sin embargo, para agilizar el ciclo de feedback del desarrollador y prevenir el envío prematuro de código con fallos de linting, omisiones en OpenSpec o falta de cobertura de pruebas unitarias, se plantea la integración de Git Hooks locales mediante `husky`.

## Problema de Negocio
1. Enviar código con errores de linting o tipos a GitHub genera ejecuciones fallidas en Actions que consumen minutos de cómputo y obligan a crear commits de corrección evitables.
2. La ausencia de un guardián de calidad en el momento del `git push` permite que nuevos controladores, servicios o filtros se suban sin sus pruebas unitarias correspondientes.
3. Exigir un 80% de cobertura de forma global en todo el proyecto bloquearía los pushes debido al código heredado o módulos de configuración que carecen de tests unitarios aislados.

## Solución Propuesta
1. **Instalación y Configuración de Husky:**
   - Incorporar `husky` como dependencia de desarrollo en la raíz del monorepo.
   - Configurar el hook `.husky/pre-push` para interceptar cada comando `git push`.
2. **Validación de Linter y OpenSpec:**
   - Ejecutar `npm run lint` y `npm run spec:check` en el pre-push.
3. **Auditoría de Cobertura Incremental Full-Stack (Código Nuevo / Modificado):**
   - Diseñar el script `scripts/check-coverage-diff.js` que:
     - Identifica los archivos `.ts` modificados o añadidos en el commit / branch actual contra la base (`origin/main` o `HEAD~1`).
     - **Backend:** Ejecuta Jest generando `apps/backend/coverage/coverage-summary.json`.
     - **Frontend:** Ejecuta Vitest en los microfrontends afectados (`@vitest/coverage-v8`) generando `apps/frontend/coverage/<mfe>/coverage-summary.json`.
     - Verifica que los archivos nuevos/modificados de lógica posean una cobertura mínima del 80% en líneas.
     - Aborta el `push` con un mensaje claro y detallado en español si algún archivo nuevo no alcanza el umbral.

## Criterios de Aceptación (CA)
- **CA-01:** Husky está instalado y configurado en la raíz del proyecto.
- **CA-02:** El hook `.husky/pre-push` se dispara automáticamente al ejecutar `git push`.
- **CA-03:** Si existe algún error de ESLint (`npm run lint`), el push se cancela de forma inmediata.
- **CA-04:** Si alguna especificación OpenSpec está rota o incompleta (`npm run spec:check`), el push se cancela.
- **CA-05:** Todo código nuevo o modificado en `apps/backend/src/` y `apps/frontend/projects/*/src/app/` debe superar el 80% de cobertura de líneas para permitir el push.
- **CA-06:** Cero riesgo en base de datos (0 alteraciones a esquemas o migraciones).
