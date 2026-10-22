# Tasks: primeng-components-refactor

**Fecha:** 2026-10-22  
**Estado:** ✅ Completado  

---

## Fase 1: Notificaciones Centralizadas en `spt-users` (@core)

- [x] **TASK-01**: Refactorizar [login.component.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/login/login.component.ts) y [login.component.html](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/login/login.component.html):
  - Retirar `<p-toast></p-toast>` y la importación de `ToastModule`.
  - Retirar `providers: [MessageService]` e inyectar `NotificationService` desde `@core`.
  - Reemplazar `this.messageService.add(...)` por `this.notify.error(...)` / `this.notify.success(...)`.
  - Actualizar [login.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/login/login.component.spec.ts) para usar mock de `NotificationService`.
- [x] **TASK-02**: Refactorizar [register.component.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/register/register.component.ts) y [register.component.html](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/register/register.component.html):
  - Retirar `<p-toast></p-toast>` y `ToastModule`.
  - Retirar `providers: [MessageService]` y usar `NotificationService`.
  - Actualizar [register.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/register/register.component.spec.ts).
- [x] **TASK-03**: Refactorizar [profile.component.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/profile/profile.component.ts) y [profile.component.html](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/profile/profile.component.html):
  - Retirar `<p-toast></p-toast>` y `ToastModule`.
  - Retirar `providers: [MessageService]` y usar `NotificationService`.
  - Actualizar [profile.component.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-users/src/app/pages/profile/profile.component.spec.ts).

## Fase 2: Modernización de Tablas `p-table` (`[stripedRows]`)

- [x] **TASK-04**: Actualizar tablas en vistas de `spt-admin`:
  - `facilities-list.component.html`: Sustituir `styleClass="p-datatable-striped"` por `[stripedRows]="true"`.
  - `facility-blocks.component.html`: Sustituir `styleClass="p-datatable-striped"` por `[stripedRows]="true"`.
  - `pricing-list.component.html`: Sustituir `styleClass="p-datatable-striped"` por `[stripedRows]="true"`.
  - `club-members.component.html`: Sustituir `styleClass="p-datatable-striped"` por `[stripedRows]="true"`.
  - `superadmin-clubs.component.html`: Sustituir `styleClass="p-datatable-striped"` por `[stripedRows]="true"`.
- [x] **TASK-05**: Actualizar tablas en vistas de `spt-portal`:
  - `my-bookings.component.html`: Verificar y aplicar `[stripedRows]="true"`.

## Fase 3: Modernización de Formularios (`[fluid]`, `inputId`, `[invalid]`)

- [x] **TASK-06**: En `facilities-list.component.html`:
  - Sustituir `styleClass="w-full"` por `[fluid]="true"` en `p-select` y `p-inputnumber`.
  - Asignar `inputId` y sincronizar con `label[for]`.
  - Añadir `[invalid]` a inputs y selects vinculados a errores de validación.
- [x] **TASK-07**: En `pricing-list.component.html`:
  - Sustituir `styleClass="w-full"` por `[fluid]="true"` en inputs numéricos y selectores.
  - Asignar `inputId` y sincronizar con `label[for]`.
- [x] **TASK-08**: En `superadmin-clubs.component.html`:
  - Sustituir `styleClass="w-full"` por `[fluid]="true"`.
  - Asignar `inputId` y sincronizar con `label[for]`.
- [x] **TASK-09**: En `login.component.html` y `register.component.html`:
  - Aplicar `[fluid]="true"` en `p-password`.
  - Añadir `[invalid]` a los inputs de texto y contraseña.

## Fase 4: Limpieza de Imports Muertos

- [x] **TASK-10**: Retirar imports de `CardModule` y `FloatLabelModule` innecesarios en:
  - `dashboard.component.ts` (`spt-admin`).
  - `portal-home.component.ts` (`spt-portal`).
  - `login.component.ts`, `register.component.ts`, `profile.component.ts` (`spt-users`).

## Fase 5: Validación de Calidad y Pruebas

- [x] **TASK-11**: Ejecutar suite completa de tests (`npm test`) verificando 100% aprobados (especialmente en `spt-users`).
- [x] **TASK-12**: Ejecutar `npm run build:all` asegurando compilación limpia.
- [x] **TASK-13**: Validar integridad de especificaciones con `node scripts/validate-specs.js`.
