# Delta de Especificación: Rediseño del Layout del Header de Reservas

## 1. Reglas de Negocio (RN)

- **RN-01 (Estructura en Dos Niveles):** El encabezado de filtros y navegación de reservas debe organizarse en dos niveles visuales:
  - Nivel 1: Selector de granularidad temporal (`day`, `week`, `month`) y filtros de contexto de pista/deporte.
  - Nivel 2: Barra de navegación temporal de período activo (botones de salto temporal y selector de fecha).
- **RN-02 (Navegación Simétrica y Homogénea):** Todas las vistas temporales deben proporcionar botones de navegación anterior (`<`), período actual (`Hoy`, `Esta semana`, `Mes actual`) y siguiente (`>`).
- **RN-03 (Acceso Rápido Diario):** La vista diaria debe mantener accesos directos tanto a `Hoy` como a `Mañana`, deshabilitando el paso a días anteriores a la fecha mínima permitida (`minDate`).
- **RN-04 (Localización Completa en Español):** Toda visualización de fechas, días de la semana y nombres de meses debe renderizarse en español sin textos o abreviaturas en inglés.
- **RN-05 (Conformidad con Sistema de Diseño):** Todos los espaciados, bordes, radios y transiciones deben emplear tokens oficiales de `_variables.scss` (`--spacing-2xs` a `--spacing-2xl`, `--radius-sm` a `--radius-full`, `--surface-card`, `--border-subtle`).

## 2. Casos de Uso (CU)

### CU-01: Navegación en Vista Diaria
- **Actor:** Usuario del portal de socios.
- **Flujo Principal:**
  1. El usuario visualiza la fecha actual seleccionada.
  2. Pulsa el botón `[ > ]` (Día siguiente).
  3. El sistema actualiza `selectedCalendarDate` al día siguiente, actualiza el indicador visual y recarga la disponibilidad de pistas.
  4. Pulsa el botón `[ < ]` (Día anterior).
  5. El sistema retrocede un día si la fecha es mayor o igual a `minDate`. Si alcanza `minDate`, el botón `[ < ]` se deshabilita para evitar reservas en el pasado.

### CU-02: Navegación y Selección en Vista Semanal
- **Actor:** Usuario del portal de socios.
- **Flujo Principal:**
  1. El usuario selecciona la granularidad `Semana`.
  2. El header muestra el selector de pista en el Nivel 1 y los controles `[ < ] [ Esta semana ] [ > ]` en el Nivel 2.
  3. El usuario pulsa `[ < ]` o `[ > ]` para moverse entre semanas, o hace clic en el selector de fecha para saltar a una semana concreta.

### CU-03: Navegación y Selección en Vista Mensual
- **Actor:** Usuario del portal de socios.
- **Flujo Principal:**
  1. El usuario selecciona la granularidad `Mes`.
  2. En el Nivel 2, el usuario visualiza `[ < ] [ Mes actual ] [ > ]` junto con el nombre del mes en español (ej. `Octubre 2026`).
  3. Al pulsar `[ > ]`, avanza al mes siguiente (`Noviembre 2026`) y la cuadrícula mensual actualiza los datos.
