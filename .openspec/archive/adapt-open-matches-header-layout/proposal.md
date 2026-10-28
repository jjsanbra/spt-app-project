# Propuesta: Adaptación del Header y Barra de Filtros de Partidas Abiertas (`open-matches`) al Estándar de Reservas

## Contexto
En la vista de Partidas Abiertas del portal de socios (`spt-portal/pages/open-matches`), la barra de filtrado temporal y selección de deporte se implementó inicialmente con un `<input type="date">` plano nativo, botones de texto sueltos sin estilo de selección activa para "Hoy" y "Mañana", y un `<p-select size="large">` con etiquetas HTML nativas. Esto genera una disparidad visual y de usabilidad notable frente a la cabecera y barra de navegación temporal de la vista principal de Reservas (`bookings-grid`), la cual cuenta con botones de navegación con chevrones (`nav-arrow-btn`), botones rápidos estilizados (`nav-quick-btn`) con estado activo resaltado, selector de calendario compacto de PrimeNG (`p-datepicker`) y filtros de deporte estilizados y alineados.

## Problema de Negocio / UX
- **Inconsistencia de interfaz:** Los socios experimentan una interfaz desigual entre la vista de cuadrícula de reservas y la vista de partidas abiertas de la comunidad.
- **Falta de componentes de diseño de PrimeNG:** El uso de controles HTML nativos (`<input type="date">`) rompe el tema visual Aura / SPT y complica la navegación en pantallas móviles o navegadores que renderizan los inputs date con formatos dispares.
- **Navegación temporal limitada:** No existían flechas de día anterior / día siguiente para desplazarse con rapidez entre jornadas sin abrir el calendario.

## Solución Propuesta
1. Homogeneizar el layout de controles de `OpenMatchesComponent` adoptando la estructura de tarjeta de filtros `.filter-controls-card` utilizada en `BookingsGridComponent`.
2. Implementar los controles de navegación temporal de PrimeNG:
   - Botón de día anterior (`pi-chevron-left`, con bloqueo para fechas pasadas).
   - Botones de salto rápido `Hoy` y `Mañana` (`pButton` con variante `outlined="true"` y clase `.is-selected` cuando coinciden con la fecha activa).
   - Botón de día siguiente (`pi-chevron-right`).
   - Selector de fecha oficial `p-datepicker` compacto (`size="small"`, `dateFormat="dd/mm/yy"`, icono integrado y `appendTo="body"`).
3. Integrar el filtro de Deporte con `p-select` compacto (`size="small"`, `scrollHeight="320px"`), alineado a la derecha de los controles de fecha en escritorio y apilado responsivamente en dispositivos móviles.
4. Conectar la lógica reactiva en el componente TypeScript con `selectedCalendarDate`, `minDate`, métodos de avance/retroceso y recarga automática de partidas.

## Criterios de Aceptación (CA)
- **CA-1:** La barra de filtros de `open-matches` se renderiza dentro de una tarjeta `.filter-controls-card` consistente con el sistema de diseño de SPT.
- **CA-2:** Se incluyen botones de flecha anterior y siguiente para navegar día a día. El botón anterior está desactivado si la fecha actual es igual o menor a hoy.
- **CA-3:** Los botones "Hoy" y "Mañana" indican visualmente cuál está seleccionado mediante la clase `.is-selected`.
- **CA-4:** Se utiliza `p-datepicker` de PrimeNG con formato `dd/mm/yy` en lugar de `<input type="date">`.
- **CA-5:** El filtro de deporte utiliza `p-select` estilizado y alineado con la barra de navegación temporal.
- **CA-6:** Todo el diseño es responsivo y se adapta limpiamente en resoluciones móvil y tablet mediante los mixins `@include mobile-or-tablet`.
- **CA-7:** Todos los textos emplean `ngx-translate`.
- **CA-8:** 100% de tests unitarios de frontend pasando sin regresiones.
