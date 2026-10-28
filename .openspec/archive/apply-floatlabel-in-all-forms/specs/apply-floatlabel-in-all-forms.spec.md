# Especificación: apply-floatlabel-in-all-forms

## 1. Alcance
Define el comportamiento y reglas de presentación para el componente de etiquetas flotantes (`<p-floatlabel variant="in">`) en todos los formularios interactivos de la aplicación SPT App.

## 2. Reglas de Negocio y Presentación

### RN-01: Posicionamiento Integrado (`variant="in"`)
- Toda etiqueta de campo interactivo (`input`, `textarea`, `select`, `password`, `datepicker`) debe ubicarse dentro del recuadro visual del control mediante `variant="in"`.
- Cuando el campo se encuentra vacío y sin foco, la etiqueta se muestra en el centro vertical del input.
- Cuando el campo adquiere foco o contiene valor (estado `.p-filled`), la etiqueta se reduce de tamaño (0.75rem) y se posiciona en la parte superior interna del control.

### RN-02: Aislamiento de Mensajes de Validación
- Los mensajes de retroalimentación de error (`<small class="form-error">`) no deben quedar atrapados dentro del contenedor `<p-floatlabel>`.
- Deben posicionarse inmediatamente después de `<p-floatlabel>` como hermanos en el contenedor `.form-group`.

### RN-03: Internacionalización Exhaustiva
- Todo `<label>` debe consumir claves i18n del diccionario oficial (`es.json`).
- Queda prohibido el uso de literales en texto crudo o placeholders que compitan con el label.
