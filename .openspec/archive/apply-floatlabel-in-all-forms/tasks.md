# Tareas: apply-floatlabel-in-all-forms

## Fase 1: Hojas de Estilo del Design System
- [x] TASK-01: Añadir soporte canónico y utilidades para `p-floatlabel` en `apps/frontend/projects/spt-app/src/styles/components/_forms.scss`.

## Fase 2: Formularios de Autenticación y Usuarios (`spt-users`)
- [x] TASK-02: Integrar `FloatLabel` en `login.component.ts` y aplicar `<p-floatlabel variant="in">` en `login.component.html`.
- [x] TASK-03: Integrar `FloatLabel` en `register.component.ts` y aplicar `<p-floatlabel variant="in">` en `register.component.html`.
- [x] TASK-04: Integrar `FloatLabel` en `profile.component.ts` y aplicar `<p-floatlabel variant="in">` en `profile.component.html`.

## Fase 3: Formularios de Administración (`spt-admin`)
- [x] TASK-05: Aplicar `<p-floatlabel variant="in">` en modal de pistas (`facilities-list.component.ts` y `.html`).
- [x] TASK-06: Aplicar `<p-floatlabel variant="in">` en modal de bloqueos (`facility-blocks.component.ts` y `.html`).
- [x] TASK-07: Aplicar `<p-floatlabel variant="in">` en modal de tarifas (`pricing-list.component.ts` y `.html`).
- [x] TASK-08: Aplicar `<p-floatlabel variant="in">` en modales de miembros e invitación (`club-members.component.ts` y `.html`).
- [x] TASK-09: Aplicar `<p-floatlabel variant="in">` en modal de configuración de club (`club-settings.component.ts` y `.html`).
- [x] TASK-10: Aplicar `<p-floatlabel variant="in">` en modal de clubes de superadmin (`superadmin-clubs.component.ts` y `.html`).

## Fase 4: Formularios de Portal (`spt-portal`)
- [x] TASK-11: Aplicar `<p-floatlabel variant="in">` en modal/formulario de reservas (`bookings-grid.component.ts` y `.html`).

## Fase 5: Validación y Calidad
- [x] TASK-12: Ejecutar suite de pruebas unitarias (`npm run test:frontend`) asegurando 255/255 aprobadas.
- [x] TASK-13: Ejecutar compilación completa (`npm run build:all`) para todos los microfrontends.
- [x] TASK-14: Verificar integridad de especificaciones con `npm run spec:check`.
