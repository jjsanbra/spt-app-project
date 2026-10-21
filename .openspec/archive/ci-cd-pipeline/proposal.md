# Propuesta: Automatización de Integración Continua (CI/CD Pipeline)

## Contexto
El proyecto `spt-app-project` ha alcanzado la madurez funcional de las Fases 0 a 8 con un monorepo que alberga una API en NestJS y 4 microfrontends en Angular con Native Federation. Para garantizar que cada contribución mantenga los estándares de calidad, seguridad y arquitectura sin regresiones, es imperativo establecer un pipeline automatizado de Integración Continua (CI) mediante GitHub Actions.

## Problema de Negocio
Sin un pipeline de CI automatizado:
1. Las regresiones en pruebas unitarias de backend (58 tests) o frontend (93 tests) pueden pasar desapercibidas antes de mezclar código en `main`.
2. Fallos de compilación en los microfrontends (`spt-admin`, `spt-portal`, `spt-users`, `spt-app`) solo se descubren en tiempo de despliegue en Render, interrumpiendo el servicio.
3. Inconsistencias en especificaciones OpenSpec o desincronizaciones de tipos Orval no se detectan tempranamente.
4. Falta validación estática de código (ESLint) en el backend.

## Solución Propuesta
1. **Configuración de GitHub Actions (`.github/workflows/ci.yml`):**
   - Disparador en `push` a ramas principales (`main`, `develop`) y en `pull_request`.
   - **Job Backend:** Checkout, setup de Node.js 22, cache de npm, instalación, generación de cliente Prisma, linting, tests unitarios con Jest y compilación de NestJS.
   - **Job Frontend:** Checkout, setup de Node.js 22, cache de npm, instalación, tests unitarios con Vitest/Karma de los 4 microfrontends y compilación en modo producción (`build:all`).
   - **Job Espec / Calidad:** Validación de integridad OpenSpec (`npm run spec:check`).
2. **Corrección de Linter en Backend:**
   - Crear `.eslintrc.js` estándar en `apps/backend` compatible con NestJS y TypeScript para que `npm run lint` pase limpiamente.
3. **Script de Verificación OpenSpec (`scripts/validate-specs.js`):**
   - Implementar el validador referenciado en `package.json` (`npm run spec:check`) para asegurar que no queden cambios con formato incompleto o inválido.

## Criterios de Aceptación (CA)
- **CA-01:** El archivo `.github/workflows/ci.yml` está presente y syntácticamente validado para GitHub Actions con Node.js 22.
- **CA-02:** `npm run lint` se ejecuta con éxito en `apps/backend` y no arroja errores bloqueantes.
- **CA-03:** `npm run spec:check` valida correctamente la presencia y estructura de especificaciones en `.openspec/`.
- **CA-04:** La compilación y pruebas de backend y frontend se ejecutan de manera aislada y reproducible en el flujo de CI.
- **CA-05:** Cero riesgo para la base de datos (0 modificaciones a esquemas de Prisma o migraciones).
