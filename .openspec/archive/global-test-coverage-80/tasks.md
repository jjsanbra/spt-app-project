# Tasks: global-test-coverage-80

**Fecha:** 2026-10-21  
**Estado:** 🟢 Completado  

---

## Fase 1: Configuración de Métricas y Servicios Faltantes de Backend
- [x] 1.1 Excluir `main.ts`, `*.module.ts` y `*.dto.ts` de `collectCoverageFrom` en `apps/backend/package.json`.
- [x] 1.2 Implementar [users.service.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/users/users.service.spec.ts) para `users.service.ts`.
- [x] 1.3 Implementar [health.service.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/health/health.service.spec.ts) para `health.service.ts`.
- [x] 1.4 Implementar [email-notification.service.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/notifications/email-notification.service.spec.ts) para `email-notification.service.ts`.
- [x] 1.5 Ampliar cobertura en [facilities.service.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/facilities/facilities.service.spec.ts), [clubs-members.service.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/clubs/clubs-members.service.spec.ts) y [superadmin-clubs.service.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/superadmin/superadmin-clubs.service.spec.ts).

## Fase 2: Pruebas Unitarias de Guards, Estrategias y Decoradores
- [x] 2.1 Implementar `tenant.guard.spec.ts` validando cabecera `x-club-id`, membresías activas y bypass superadmin.
- [x] 2.2 Implementar `roles.guard.spec.ts` validando permisos y jerarquías.
- [x] 2.3 Implementar `super-admin.guard.spec.ts` validando condición booleana.
- [x] 2.4 Implementar `jwt-auth.guard.spec.ts` y `jwt.strategy.spec.ts`.
- [x] 2.5 Implementar tests para decoradores personalizados (`current-user`, `current-tenant`, `roles`, `public`).

## Fase 3: Pruebas Unitarias de Controladores NestJS
- [x] 3.1 Implementar [auth.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/auth/auth.controller.spec.ts).
- [x] 3.2 Implementar [bookings.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/bookings/bookings.controller.spec.ts).
- [x] 3.3 Implementar [clubs.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/clubs/clubs.controller.spec.ts) y [clubs-members.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/clubs/clubs-members.controller.spec.ts).
- [x] 3.4 Implementar [facilities.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/facilities/facilities.controller.spec.ts).
- [x] 3.5 Implementar [pricing.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/pricing/pricing.controller.spec.ts).
- [x] 3.6 Implementar [superadmin-clubs.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/superadmin/superadmin-clubs.controller.spec.ts).
- [x] 3.7 Implementar [users.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/users/users.controller.spec.ts), [notifications.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/notifications/notifications.controller.spec.ts) y [health.controller.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/backend/src/health/health.controller.spec.ts).

## Fase 4: Elevar Cobertura en Microfrontends (`spt-admin` y `spt-app`)
- [x] 4.1 Ampliar pruebas en [facilities-list.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-admin/src/app/pages/facilities/facilities-list.component.spec.ts), [club-members.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-admin/src/app/pages/members/club-members.component.spec.ts), [pricing-list.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-admin/src/app/pages/pricing/pricing-list.component.spec.ts), [facility-blocks.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-admin/src/app/pages/facilities/facility-blocks.component.spec.ts), [club-settings.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-admin/src/app/pages/settings/club-settings.component.spec.ts) y [superadmin-clubs.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-admin/src/app/pages/superadmin/clubs/superadmin-clubs.component.spec.ts) para alcanzar >= 80% en `spt-admin`.
- [x] 4.2 Implementar [auth.service.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/app/core/services/auth.service.spec.ts) y ampliar [app.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/app/app.spec.ts) en `spt-app` para alcanzar >= 80% en `spt-app`.

## Fase 5: Validación Integral, CI y Cierre
- [x] 5.1 Ejecutar `npm run test:cov` en backend comprobando global >= 80% (90.91% conseguido).
- [x] 5.2 Ejecutar cobertura en frontend comprobando todos los microfrontends >= 80% (`spt-app`: 87.26%, `spt-users`: 85.27%, `spt-admin`: 81.48%, `spt-portal`: 80.24%).
- [x] 5.3 Validar `npm run lint` y `node scripts/validate-specs.js` (ambos limpios con 0 errores).
