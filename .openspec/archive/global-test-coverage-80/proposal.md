# Proposal: global-test-coverage-80

**Fecha:** 2026-10-21  
**Estado:** ✅ Completado
**Archivado:** 2026-10-21  
**Autor:** Antigravity + Usuario  

---

## 1. Contexto y Motivación

Actualmente el proyecto cuenta con pruebas unitarias de alta calidad en servicios de backend y microfrontends clave, pero la cobertura global del backend se sitúa en un 33.5% (debido a la ausencia de tests en controladores, guards, decoradores y módulos auxiliares) y dos proyectos de frontend (`spt-admin` con 78.34% y `spt-app` con 75.05%) se encuentran ligeramente por debajo del umbral estándar del 80%.

El usuario ha solicitado de forma expresa elevar la cobertura total a un mínimo del **80% global** tanto en Backend como en Frontend, garantizando robustez frente a regresiones, verificación de contratos en controladores y cumplimiento de las directivas de calidad del proyecto.

---

## 2. Solución Propuesta

Implementar una estrategia exhaustiva de pruebas unitarias dividida en dos grandes bloques:

1. **Backend (`apps/backend`):**
   * Configurar `jest.config` para normalizar la recolección de cobertura excluyendo archivos sin lógica ejecutable de negocio (`main.ts` y DTOs de solo tipos/decoradores pasivos si aplica, o testearlos adecuadamente).
   * Añadir suites de pruebas unitarias para todos los controladores NestJS (`auth.controller`, `bookings.controller`, `clubs.controller`, `clubs-members.controller`, `facilities.controller`, `pricing.controller`, `superadmin-clubs.controller`, `users.controller`, `notifications.controller`, `health.controller`).
   * Añadir pruebas unitarias para guards y estrategias (`jwt-auth.guard`, `roles.guard`, `super-admin.guard`, `tenant.guard`, `jwt.strategy`).
   * Elevar la cobertura de los servicios pendientes a >= 85%: `facilities.service`, `superadmin-clubs.service`, `clubs-members.service`, `users.service`, `health.service`, `email-notification.service`.
   * Alcanzar un mínimo de **80% de líneas globales** en `jest --coverage`.

2. **Frontend (`apps/frontend`):**
   * Añadir pruebas unitarias en `spt-admin` para componentes clave (`facilities-list`, `club-members`, `pricing-list`) elevando la cobertura del 78.34% a **>= 80%**.
   * Añadir pruebas unitarias en `spt-app` (Shell) para `auth.service.ts` y componentes del host elevando la cobertura del 75.05% a **>= 80%**.
   * Mantener `spt-users` (85.27%) y `spt-portal` (80.24%) por encima de su umbral.

---

## 3. Criterios de Aceptación

- [ ] **CA-01:** La suite de pruebas de Backend (`npm run test:cov`) debe ejecutarse sin errores y reportar una cobertura global de líneas igual o superior al **80%**.
- [ ] **CA-02:** Todos los controladores de NestJS deben contar con su archivo `.spec.ts` validando la delegación a sus respectivos servicios, inyección de dependencias y respuestas HTTP.
- [ ] **CA-03:** Todos los guards de seguridad y aislamiento multi-tenant (`tenant.guard`, `roles.guard`, `super-admin.guard`, `jwt-auth.guard`) deben estar probados con casos positivos y negativos.
- [ ] **CA-04:** El microfrontend `spt-admin` debe alcanzar una cobertura total de líneas >= **80%** en Vitest.
- [ ] **CA-05:** El microfrontend `spt-app` (Shell host) debe alcanzar una cobertura total de líneas >= **80%** en Vitest.
- [ ] **CA-06:** El hook de Husky `pre-push` y `scripts/check-coverage-diff.js` deben continuar pasando de forma limpia y transparente.

---

## 4. Impacto Estimado

- **Backend:** Creación de múltiples suites de tests `.spec.ts` en `src/` (controladores, guards, servicios restantes). Cero cambios en lógica de producción.
- **Frontend:** Creación y ampliación de specs en `spt-admin` y `spt-app`.
- **Base de datos:** Ningún impacto en esquema, datos o migraciones.
- **Riesgo:** 🟢 Bajo (desarrollo puramente orientado a testing unitario sin riesgo destructivo en producción).

---

## 5. Dependencias

- Ninguna dependencia previa bloqueante.
