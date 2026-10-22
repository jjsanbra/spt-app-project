# Propuesta: Corrección de Estilos en Botón de Salir del Sidebar y Panel de Calendarios DatePicker PrimeNG

## Contexto
Durante la revisión visual de la interfaz en modo oscuro y en la vista de cuadrícula de reservas, se han detectado dos problemas de diseño y estilos:
1. **Botón de salir en el sidebar:** El botón de logout no muestra su icono correctamente y aparece aplastado con una forma oblonga/rectangular deformada debido a una colisión de estilos en la directiva `.p-button.p-button-danger` global y la falta de dimensiones explícitas e icono en el marcado hijo.
2. **Componente de calendario (DatePicker) de PrimeNG:** Al desplegar el selector de fechas (`p-datepicker`), el panel emergente (`p-datepicker-panel`) carece de fondo sólido opaco (`background-color`), resultando en una capa transparente donde el texto de los días del calendario se superpone y entremezcla con el contenido de la cuadrícula inferior. Adicionalmente, el diseño de la cabecera, botones de navegación, días de la semana y estado seleccionado no están adaptados al Design System de la aplicación ni a los temas claro y oscuro.

## Problema de Negocio / UI
- **Pérdida de usabilidad y accesibilidad:** Los usuarios no pueden leer con claridad los días ni seleccionar fechas con comodidad en el calendario.
- **Inconsistencia visual en navegación:** El botón de cierre de sesión en el pie del sidebar no es reconocible como una acción interactiva ni guarda simetría con el botón contiguo de cambio de tema.

## Solución Propuesta
1. **Estilos transversales para DatePicker en Design System (`_datepicker.scss`):**
   - Crear el componente modular `apps/frontend/projects/spt-app/src/styles/components/_datepicker.scss` e importarlo en el manifiesto central `_index.scss`.
   - Aplicar superficie sólida (`var(--surface-card)`), desenfoque de fondo (`backdrop-filter`), sombra elevada (`var(--shadow-tier3)`) y borde sutil (`var(--border-subtle)`) al panel emergente `.p-datepicker-panel`.
   - Estilizar la cabecera del calendario (`.p-datepicker-header`), títulos, botones de navegación anterior/siguiente (`.p-datepicker-prev-button`, `.p-datepicker-next-button`).
   - Diseñar las celdas de días (`.p-datepicker-day`), estados hover, día de hoy (`.p-datepicker-today`) y día seleccionado con el gradiente o color de marca primario (`var(--primary-color)` / `var(--primary-gradient)`), garantizando alto contraste.
2. **Corrección del Botón de Salir en Sidebar (`app.html`, `app.scss`, `_buttons.scss`):**
   - Asegurar que el botón contenga explícitamente el icono `<i class="pi pi-sign-out"></i>`.
   - Normalizar la regla `.p-button.p-button-danger` en `_buttons.scss` con `:not(.p-button-text):not(.p-button-outlined)` para que no fuerce bordes y fondos de bloque a botones de tipo texto o redondeados.
   - Definir en `app.scss` dimensiones uniformes circulares (`2.25rem x 2.25rem`), alineación centrada y estilo coherente para `.logout-btn` junto a `.theme-toggle-btn`.

## Criterios de Aceptación (CA)
- **CA-1 (Botón Logout Sidebar):** El botón de salir en el sidebar debe mostrarse perfectamente circular con icono de logout visible (`pi pi-sign-out`), fondo semitransparente de peligro/disputa, hover con retroalimentación visual clara y simetría con el botón de alternancia de tema.
- **CA-2 (DatePicker Panel Opaco):** Al abrir el desplegable de `p-datepicker`, el panel debe ser completamente opaco con fondo `var(--surface-card)`, borde `var(--border-subtle)` y sombra `var(--shadow-tier3)`, sin dejar traslucir los elementos subyacentes de la página.
- **CA-3 (DatePicker Tipografía y Selección):** La cabecera, días de la semana y números de día deben ser legibles con la paleta de tokens del tema (tanto en claro como en oscuro); el día seleccionado debe destacarse limpiamente con `var(--primary-color)` y texto blanco.
- **CA-4 (No Regresiones):** Compilación (`npm run build:all`) y suite de pruebas unitarias (`npm test`) pasando al 100%.
