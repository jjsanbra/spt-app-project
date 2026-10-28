# Tareas: Unificación Global de Estilos y Componente DatePicker

## Fase 1: Design System Central (`spt-app`)
- [x] 1.1 Extender `_forms.scss` con la regla de ancho fluido para `p-datepicker` en `.form-group`, modales y `.w-full`.
- [x] 1.2 Refactorizar `_datepicker.scss` con la especificación completa de inputs, variantes de tamaño y `.p-datepicker-time-picker`.

## Fase 2: Componente Bloqueos de Pistas (`spt-admin`)
- [x] 2.1 Importar `DatePickerModule` en `FacilityBlocksComponent` (`facility-blocks.component.ts`).
- [x] 2.2 Reemplazar los inputs nativos `type="datetime-local"` por `p-datepicker` con `[showTime]="true"`, `hourFormat="24"`, `dateFormat="dd/mm/yy"`, `[showIcon]="true"`, `iconDisplay="input"` y `[appendTo]="'body'"`.
- [x] 2.3 Asegurar manejo reactivo de fechas nulas o Date en `facility-blocks.component.ts`.

## Fase 3: Verificación y Pruebas
- [x] 3.1 Ejecutar `npm run test:frontend` y asegurar que todas las pruebas pasen (incluyendo `facility-blocks.component.spec.ts`).
- [x] 3.2 Ejecutar `npm run build:all` para comprobar compilación de todos los microfrontends.
- [x] 3.3 Validar especificaciones con `npm run spec:check`.
