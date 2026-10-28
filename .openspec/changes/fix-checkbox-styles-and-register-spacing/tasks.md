# Tareas: fix-checkbox-styles-and-register-spacing

## Fase 1: Tokens y Estilos de Checkbox
- [x] TASK-01: Añadir tokens semánticos de PrimeNG Checkbox en `apps/frontend/projects/spt-app/src/styles/base/_variables.scss`.
- [x] TASK-02: Estandarizar reglas de `.p-checkbox` y `.p-checkbox-box` en `apps/frontend/projects/spt-app/src/styles/components/_forms.scss`.
- [x] TASK-03: Ajustar espaciado y alineación de `.form-group-checkbox` en `apps/frontend/projects/spt-users/src/app/pages/login/login.component.scss` y `_auth.scss`.

## Fase 2: Espaciados en Registro
- [x] TASK-04: Ajustar espaciado entre campos (`gap: var(--spacing-lg)`), separación de label (`gap: 6px`) y columnas de formulario en `apps/frontend/projects/spt-users/src/app/pages/register/register.component.scss`.
- [x] TASK-05: Ajustar márgenes de `.auth-header`, `.form-actions` y `.auth-footer` para equilibrio visual en `register.component.scss`.

## Fase 3: Pruebas y Validación
- [x] TASK-06: Ejecutar pruebas unitarias de `spt-users` con `npx ng test spt-users --watch=false`.
- [x] TASK-07: Validar que el build compila correctamente con `npx ng build spt-users`.
- [x] TASK-08: Validar especificaciones con `npm run spec:check`.
