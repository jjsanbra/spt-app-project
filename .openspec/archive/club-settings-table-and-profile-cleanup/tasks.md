# Tasks: club-settings-table-and-profile-cleanup

**Fecha:** 2026-10-28  
**Estado:** ✅ Completado  

---

## Fase 1: Limpieza de «Mi Perfil» (`spt-users`)

- [x] FRONT-01: Retirar la tarjeta de clubes y membresías en `apps/frontend/projects/spt-users/src/app/pages/profile/profile.component.html`.
- [x] FRONT-02: Centrar y estilizar el formulario de datos personales en `profile.component.scss` para layout limpio de columna única.
- [x] FRONT-03: Limpiar métodos y dependencias huérfanas en `profile.component.ts` (`onSelectActiveClub`, `userMemberships`).
- [x] FRONT-04: Actualizar pruebas unitarias en `profile.component.spec.ts`.

---

## Fase 2: Evolutivo de «Configuración de Clubes» (`spt-admin`)

- [x] FRONT-05: Modificar `club-settings.component.ts` para gestionar la lista de clubes administrados (`managedClubs`), estado del modal (`displayModal`) y club seleccionado (`selectedClub`).
- [x] FRONT-06: Incorporar la tabla PrimeNG `p-table` en `club-settings.component.html` mostrando clubes administrados con datos clave y acción de configuración.
- [x] FRONT-07: Integrar el diálogo modal `p-dialog` en `club-settings.component.html` con el formulario de configuración del club seleccionado.
- [x] FRONT-08: Conectar la carga y guardado multi-tenant del club enviando la cabecera `x-tenant-id` correspondiente.
- [x] FRONT-09: Agregar las claves de internacionalización necesarias en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
- [x] FRONT-10: Actualizar y expandir las pruebas unitarias en `club-settings.component.spec.ts`.

---

## Fase 3: Verificación y Validación

- [x] TEST-01: Ejecutar pruebas unitarias de `spt-users`: `npx ng test spt-users --watch=false`.
- [x] TEST-02: Ejecutar pruebas unitarias de `spt-admin`: `npx ng test spt-admin --watch=false`.
- [x] TEST-03: Ejecutar la suite completa del frontend: `npm run test:frontend`.
- [x] TEST-04: Validar integridad de especificaciones OpenSpec: `npm run spec:check`.
