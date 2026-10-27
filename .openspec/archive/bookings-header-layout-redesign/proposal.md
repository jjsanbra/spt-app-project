# Propuesta: Rediseño del Layout del Header de Reservas (`bookings-grid`)

## 1. Contexto y Problema
En la pantalla de cuadrante y reservas del portal de socios (`/portal/book`), el encabezado de control (`.filter-controls-card`) presenta actualmente una disposición desarticulada, asimétrica y carente de alineación con el Sistema de Diseño de la aplicación:

1. **Desorganización y Asimetría:**
   - La fila superior mezcla la granularidad temporal (`Día`, `Semana`, `Mes`) con filtros de negocio (`Deporte` o `Pista`) y opciones de visualización (`Cuadrante` vs `Pistas`), mientras que la fila inferior concentra botones temporales a la izquierda dejando un gran espacio vacío a la derecha.
2. **Inconsistencia Funcional entre Granularidades:**
   - **Vista Día:** Ofrece accesos rápidos a `Hoy` y `Mañana` junto a un `DatePicker`, pero carece de flechas de avance/retroceso día a día (`<` y `>`).
   - **Vista Semana:** Presenta flechas circulares y el botón `Esta semana`, pero el rango de fechas es un texto estático sin posibilidad de selección directa de fecha.
   - **Vista Mes:** Carece de traducción al español (`October 2026` en inglés) y tampoco permite seleccionar directamente un mes arbitrario sin pulsar iterativamente los botones de anterior/siguiente.
3. **Infracción del Sistema de Diseño:**
   - Los componentes `p-selectbutton` carecen de aspecto de *segmented control* integrado, viéndose los botones planos y pegados.
   - El botón de `Hoy` utiliza un fondo fucsia primario estridente y los botones circulares dependen de hacks CSS con `!important`.
   - No se respeta la jerarquía de espaciados fluidos de tokens (`--spacing-2xs`, `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`).

## 2. Solución Propuesta
Reestructurar el header en **dos niveles claramente diferenciados y balanceados**, utilizando de forma estricta los tokens de espaciado, radios y superficies del Design System:

- **Nivel 1 (Barra Superior de Contexto y Filtros):**
  - **Izquierda:** Selector de Granularidad (`p-selectbutton`) refinado como *segmented control* (`Día` | `Semana` | `Mes`).
  - **Derecha:**
    - En **Día:** Selector de deporte (`p-select`) + Selector de vista (`Cuadrante` | `Pistas`).
    - En **Semana:** Selector de pista específica (`p-select`).
    - En **Mes:** Selector de deporte (`p-select`).
- **Nivel 2 (Barra Inferior de Navegación Temporal Universal):**
  - Estructura uniforme en las 3 vistas:
    - **Bloque de Paso (Izquierda):** `[ < ]` (Anterior), `[ Período Actual ]` (Hoy / Esta semana / Mes actual), `[ > ]` (Siguiente). En vista día se incluye adicionalmente el acceso rápido `[ Mañana ]`.
    - **Bloque de Indicador y Selector de Fecha (Derecha o Centro):** Selector de fecha con `p-datepicker` integrado, formateo en español (`es-ES`) y botón con icono de calendario para saltar a cualquier fecha, semana o mes arbitrario.

## 3. Criterios de Aceptación (CA)

- **CA-01 (Jerarquía y Separación en 2 Niveles):** El header debe estructurarse en dos filas con espaciados regulados exclusivamente por tokens `--spacing-*` y una sutil línea divisoria `var(--border-subtle)`.
- **CA-02 (Segmented Controls de Granularidad y Vista):** `p-selectbutton` debe presentar estilo de control segmentado con contenedor redondeado `var(--radius-lg)`, fondo `var(--surface-container-low)` y estados activos acordes a la paleta del club.
- **CA-03 (Navegación Unificada con Flechas en Todas las Vistas):** Todas las granularidades (Día, Semana y Mes) deben contar con flechas `<` y `>` para avanzar/retroceder de período, además del botón de reseteo a la fecha actual (`Hoy`, `Esta semana`, `Mes actual`).
- **CA-04 (Localización e Internacionalización Completa):** Los nombres de meses y fechas deben formatearse en español sin textos en inglés (corrigiendo `October 2026` a `Octubre 2026`).
- **CA-05 (Responsividad Móvil):** En pantallas móviles (`@include mobile`), los dos niveles deben adaptarse verticalmente manteniendo accesibilidad táctil óptima sin desbordamientos horizontales.
- **CA-06 (Conformidad con Design System):** Prohibido el uso de valores hardcodeados en px o rem y selectores manuales `@media`. Se deben emplear tokens de `_variables.scss` y mixins de `_responsive.scss`.
