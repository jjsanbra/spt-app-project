# Tareas de Implementación: Corrección de Estilos en Sidebar Logout y DatePicker PrimeNG

## Fase 1: Design System Central
- [x] 1.1 Crear el archivo de estilos central `apps/frontend/projects/spt-app/src/styles/components/_datepicker.scss` con reglas para `.p-datepicker`, `.p-datepicker-panel`, `.p-datepicker-header`, `.p-datepicker-day`, etc.
- [x] 1.2 Registrar `@use "components/datepicker" as *;` en `apps/frontend/projects/spt-app/src/styles/_index.scss`.
- [x] 1.3 Normalizar la regla de `.p-button-danger` en `_buttons.scss` para respetar botones de texto y redondeados (`:not(.p-button-text):not(.p-button-outlined)`).

## Fase 2: Sidebar Shell Host
- [x] 2.1 Actualizar `app.html` para incluir el icono `<i class="pi pi-sign-out"></i>` explícito en el botón de logout.
- [x] 2.2 Actualizar `app.scss` para dar forma circular, dimensiones simétricas (`2.25rem`) y estilos pulidos a `.logout-btn` junto a `.theme-toggle-btn`.

## Fase 3: Validación y Pruebas
- [x] 3.1 Ejecutar `npm run build:all` para comprobar que los estilos compilan sin errores.
- [x] 3.2 Ejecutar `npm test` para asegurar que las pruebas unitarias pasan limpiamente al 100%.
- [x] 3.3 Validar especificaciones con `node scripts/validate-specs.js`.
