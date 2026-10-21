# Diseño Técnico: Automatización CI/CD con GitHub Actions (`ci-cd-pipeline`)

## Arquitectura del Pipeline

El workflow de CI se organiza en jobs concurrentes para optimizar los tiempos de ejecución:

```mermaid
graph TD
    A[Disparador: Push o Pull Request] --> B[Job: Lint & OpenSpec]
    A --> C[Job: Backend CI]
    A --> D[Job: Frontend CI]

    B --> B1[Validar OpenSpec npm run spec:check]
    B --> B2[ESLint Backend]

    C --> C1[Prisma Generate]
    C --> C2[Jest Unit Tests 58 tests]
    C --> C3[NestJS Build]

    D --> D1[Vitest Frontend Tests 93 tests]
    D --> D2[Angular Build All 4 MFEs]

    B1 & B2 & C3 & D2 --> E[Resultado: Estado de CI Aprobado en PR]
    E --> F[Fusión / Merge a main]
    F --> G[Render despliega automáticamente código 100% verificado]
```

## Estrategia de Despliegue y Protección (Opción 2: Pull Request Gate)
1. **Flujo de Trabajo:** Las ramas de funcionalidad o evolutivos abren un Pull Request contra la rama `main`.
2. **Validación Automática:** GitHub Actions ejecuta concurrentemente los jobs `lint-and-specs`, `backend-ci` y `frontend-ci`.
3. **Protección de Rama en GitHub:**
   - Se configura una regla de protección en GitHub (`Settings -> Branches -> Add rule for main`).
   - Se marca la opción *"Require status checks to pass before merging"*, seleccionando los checks del workflow.
4. **Despliegue Cero-Riesgos en Render:**
   - Render mantiene su conexión con la rama `main`.
   - Como ningún commit defectuoso puede mergearse a `main` sin pasar el CI, Render solo recibe código compilable y probado al 100%.

## Estructura de Archivos
1. `.github/workflows/ci.yml`: Definición declarativa de las etapas y entornos de ejecución.
2. `apps/backend/.eslintrc.js`: Configuración de ESLint basada en `@typescript-eslint/parser` y reglas recomendadas para NestJS.
3. `scripts/validate-specs.js`: Validador en Node.js que audita la estructura de `.openspec/changes` y `.openspec/archive`.

## Evaluación de Riesgo en Base de Datos
- **Riesgo Identificado:** **0% (Nulo)**.
- **Justificación:** Este cambio no altera entidades en `schema.prisma`, no genera migraciones SQL ni altera los datos de la base de datos de producción.
- **Acción requerida:** Ninguna acción destructiva en PostgreSQL.

## Configuración de Variables de Entorno en CI
Para los tests de backend en CI no se requiere una base de datos real viva gracias a los mocks de Prisma en Jest, pero se define `DATABASE_URL="postgresql://mock:mock@localhost:5432/test_db"` y `NODE_ENV=test` como variables de entorno de fallback en el runner.
