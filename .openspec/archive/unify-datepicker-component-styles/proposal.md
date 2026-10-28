# Propuesta: Unificación Global de Estilos y Componente DatePicker (`p-datepicker`)

## 1. Contexto y Problema
En la aplicación existían inconsistencias en el tratamiento de fechas y calendarios:
1. En vistas de gestión como Bloqueos de Pistas (`facility-blocks.component.html`), se utilizaban inputs nativos de HTML (`type="datetime-local"`), que mostraban widgets nativos del navegador con estilos discrepantes (placeholder `dd/mm/yyyy, --:--`, iconos nativos y tipografía desalineada) en lugar de utilizar el componente oficial de PrimeNG (`p-datepicker`).
2. En el Design System transversal (`_datepicker.scss` y `_forms.scss`), faltaba una estandarización completa de `p-datepicker` para soportar de forma universal y coherente:
   - Formularios modales y vistas en general (`width: 100%`, `class="w-full"`, `styleClass="w-full"`).
   - Altura estándar y variantes de tamaño (`size="small"`, default, `size="large"`).
   - Estilizado del selector de horas y minutos (`.p-datepicker-time-picker`) cuando se habilita `[showTime]="true"`.
   - Identidad visual de Stitch (bordes, radio `var(--radius-md)`, colores de superficie y acento Stitch Neon Pink).

## 2. Solución Propuesta
1. **Reemplazo de inputs nativos por `p-datepicker`:**
   Sustituir los inputs `<input type="datetime-local">` en `facility-blocks.component.html` por `<p-datepicker [showTime]="true" hourFormat="24" dateFormat="dd/mm/yy" [showIcon]="true" iconDisplay="input" [appendTo]="'body'" class="w-full" styleClass="w-full">`.
2. **Estandarización Universal en el Design System (`_datepicker.scss` y `_forms.scss`):**
   - Incorporar reglas en `_forms.scss` para que cualquier `.p-datepicker` y `p-datepicker` dentro de un `.form-group` o con `.w-full` se extienda al 100% del contenedor de forma fluida.
   - Reforzar `_datepicker.scss` para estandarizar el input interno (`.p-datepicker-input`), los iconos (`.p-datepicker-input-icon`), las variantes de tamaño y los controles de tiempo (`.p-datepicker-time-picker`, increment/decrement buttons, separador).
3. **Mantenimiento y Retrocompatibilidad:**
   - Asegurar que los datepickers existentes (`activity-logs`, `bookings-grid`, `open-matches`) mantengan su funcionalidad y estética impecable.
   - Mantener el 100% de tests unitarios pasando (`npm run test:frontend`).

## 3. Criterios de Aceptación (CA)
- **CA-1:** Ningún formulario debe emplear `<input type="date">` o `<input type="datetime-local">` nativo; todos deben utilizar el componente oficial `p-datepicker` de PrimeNG.
- **CA-2:** Los componentes `p-datepicker` con `[showTime]="true"` deben mostrar fecha en formato `dd/mm/yy`, hora en formato 24h, icono integrado en el input y panel desplegable con controles de hora/minuto estilizados con la paleta Stitch.
- **CA-3:** Todos los datepickers de la aplicación (en formularios, modales, barras de filtros y cuadrantes) deben adherirse estrictamente a las variables del Design System (`var(--...)`).
- **CA-4:** Todas las pruebas unitarias de frontend (`npm run test:frontend`) y compilaciones (`npm run build:all`) deben pasar satisfactoriamente.
