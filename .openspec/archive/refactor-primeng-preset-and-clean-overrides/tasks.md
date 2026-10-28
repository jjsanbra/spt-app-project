# Tareas: refactor-primeng-preset-and-clean-overrides

## Fase 1: Enriquecimiento del Tema Oficial (SPTPreset)
- [x] TASK-01: Configurar tokens oficiales de `card`, `button` y `avatar` en `apps/frontend/projects/spt-app/src/app/theme/spt.preset.ts`.
- [x] TASK-02: Actualizar las pruebas unitarias de `spt.preset.spec.ts` para verificar la existencia de los nuevos tokens de componentes.

## Fase 2: Saneamiento de Hojas de Estilo Centrales
- [x] TASK-03: Retirar las declaraciones `!important` en `apps/frontend/projects/spt-app/src/styles/components/_buttons.scss`.
- [x] TASK-04: Verificar que las utilidades globales (`.w-full`) operen limpiamente sin romper componentes de botón.

## Fase 3: Limpieza de Vistas Locales (spt-users)
- [x] TASK-05: Limpiar `apps/frontend/projects/spt-users/src/app/pages/login/login.component.scss` y utilizar `[fluid]="true"` en el botón de submit en `login.component.html`.
- [x] TASK-06: Limpiar `apps/frontend/projects/spt-users/src/app/pages/profile/profile.component.scss` retirando todos los `:host ::ng-deep` con `!important`.
- [x] TASK-07: Ajustar `apps/frontend/projects/spt-users/src/app/pages/register/register.component.scss` retirando `!important`.

## Fase 4: Pruebas y Validación Integral
- [x] TASK-08: Ejecutar pruebas unitarias de `spt-app`, `spt-admin`, `spt-portal` y `spt-users`.
- [x] TASK-09: Verificar compilación con `npx ng build spt-app`.
- [x] TASK-10: Validar integridad OpenSpec con `npm run spec:check`.

