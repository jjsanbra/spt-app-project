# Delta de Especificación: Adaptación del Header de Partidas Abiertas

## Reglas de Negocio y Comportamiento Funcional

### R-1: Navegación Temporal Homogénea
- La barra de navegación temporal permite a los socios filtrar partidas abiertas por fecha sin recargar la página.
- El usuario puede avanzar o retroceder de día en día con las flechas `<` y `>`.
- El botón de día anterior `<` debe deshabilitarse cuando la fecha seleccionada coincida con la fecha de hoy (`isPrevDayDisabled() === true`), impidiendo consultar partidas en fechas pasadas.
- Los botones "Hoy" y "Mañana" establecen de forma inmediata la fecha activa. Si la fecha actual coincide con hoy, el botón "Hoy" adquiere el estilo `.is-selected`; si coincide con mañana, el botón "Mañana" adquiere el estilo `.is-selected`.

### R-2: Selector de Fecha Oficial PrimeNG
- El selector de fecha debe implementarse con `p-datepicker` de PrimeNG con `dateFormat="dd/mm/yy"`, icono incrustado en el input, `[minDate]="minDate"` y `[appendTo]="'body'"`.
- Al cambiar la fecha en el datepicker, se sincroniza la fecha textual `selectedDate` (`YYYY-MM-DD`) y se desencadena la recarga de partidas disponibles mediante `bookingsService.bookingsControllerFindOpenMatches(...)`.

### R-3: Filtro por Deporte
- El filtro por deporte debe permitir seleccionar "Todos los deportes" o filtrar por cada disciplina (`SportType`).
- Se utiliza `p-select` compacto con `[appendTo]="'body'"`, conservando el scrollHeight de 320px para desplegables fluidos.
