# Delta Spec: global-test-coverage-80

**Dominio:** Testing, Calidad y Cobertura (Full-Stack)  
**Estado:** 🟡 En Revisión  

---

## 1. Requisitos de Negocio y Calidad

### R-01: Umbral Mínimo de Cobertura Global (Backend)
* **Descripción:** La ejecución de `npm run test:cov` en `apps/backend` debe certificar un porcentaje de cobertura de líneas igual o superior al 80%.
* **Alcance:** Servicios de negocio, controladores REST, filtros de excepciones, interceptores, guards de seguridad y aislamiento multi-tenant.

### R-02: Umbral Mínimo de Cobertura por Microfrontend (Frontend)
* **Descripción:** Cada microfrontend del ecosistema Angular (`spt-app`, `spt-admin`, `spt-portal`, `spt-users`) debe mantener una cobertura de pruebas unitarias superior o igual al 80% evaluada mediante Vitest.
* **Alcance:** Componentes visuales, servicios centrales de `@core`, lógica reactiva y gestión de autenticación.

---

## 2. Escenarios de Aceptación (Gherkin)

### Escenario 1: Ejecución de Cobertura en Backend
* **Dado** el conjunto completo de suites de pruebas en `apps/backend`
* **Cuando** se ejecuta `npm run test:cov`
* **Entonces** todas las suites deben finalizar con estado `PASSED`
* **Y** la métrica de líneas en el reporte general debe ser `>= 80%`.

### Escenario 2: Ejecución de Cobertura en Microfrontends
* **Dado** cada proyecto en `apps/frontend/projects/*`
* **Cuando** se ejecuta `npx ng test <proyecto> --watch=false --coverage`
* **Entonces** `spt-admin`, `spt-app`, `spt-portal` y `spt-users` deben certificar `>= 80%` de cobertura.

### Escenario 3: Verificación Pre-push con Husky
* **Dado** que un desarrollador o agente ejecuta `git push`
* **Cuando** el hook de Husky ejecuta `scripts/check-coverage-diff.js`
* **Entonces** el script debe validar que no existen regresiones y que el umbral se cumple en todo archivo modificado.
