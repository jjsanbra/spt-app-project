# Propuesta: Navegación por Granularidad (Día/Semana/Mes), Rediseño de Slots a Estilo Píldora Rosa y Reserva en Slots Vacíos

## Contexto y Necesidad
En la vista de reservas de los usuarios (`bookings-grid` en `spt-portal`), se busca mejorar sustancialmente la experiencia de usuario y planificación de partidos deportivos:
1. **Granularidad Temporal (Día, Semana, Mes):** Los usuarios necesitan conmutar la escala temporal de la cuadrícula en la parte superior de la tabla mediante navegación tipo FullCalendar (Día / Semana / Mes) para visualizar la disponibilidad de pistas en distintos horizontes temporales.
2. **Fatiga Visual en Slots Disponibles:** El color de fondo rosa sólido fluorescente actual de los slots disponibles es excesivamente intenso y recarga la interfaz. Se requiere invertir el estilo siguiendo el patrón de diseño de tags translúcidos (fondo oscuro sutil con tinte rosa, borde fino rosa neón y texto/precio en rosa neón contrastado).
3. **Reserva Directa en Slots Vacíos:** Actualmente las celdas sin slot pregenerado muestran un guion estático (`—`). Los usuarios deben poder hacer clic sobre cualquier celda vacía para abrir directamente la modal de reserva, calculando automáticamente la hora de inicio y fin sin exceder el tiempo de disponibilidad permitido.

## Solución Propuesta

### 1. Conmutador de Granularidad Temporal (Día / Semana / Mes)
- Incorporar en la barra superior de controles un selector de granularidad con `p-selectbutton` o grupo de botones con directiva `pButton`:
  - **Día:** Muestra la matriz de todas las pistas frente a las franjas horarias del día actual, con navegación diaria (anterior/hoy/siguiente/datepicker).
  - **Semana:** Muestra la cuadrícula de los 7 días de la semana actual con navegación semanal (< Semana anterior, Semana actual, Semana siguiente >), permitiendo consultar o filtrar por pista.
  - **Mes:** Muestra el calendario mensual completo indicando el nivel de disponibilidad de cada día y permitiendo seleccionar cualquier día para visualizar sus pistas.

### 2. Estilo de Slots Invertido (Píldora Neón Transparente)
- Aplicar la estética solicitada basada en tags:
  - Fondo sutil translúcido: `rgba(255, 45, 120, 0.12)`.
  - Borde fino delimitador: `1px solid rgba(255, 45, 120, 0.40)`.
  - Color de texto del precio: `color: var(--primary-color);` (`#FF2D78`).
  - Hover con resplandor neón suave: `background: rgba(255, 45, 120, 0.22); box-shadow: 0 0 14px rgba(255, 45, 120, 0.28); transform: translateY(-1px);`.
  - Slots ocupados: estilo atenuado con fondo `rgba(255, 255, 255, 0.04)` y texto apagado.

### 3. Reserva Interactiva en Slots Vacíos
- Al pulsar sobre una celda vacía (`matrix-slot-empty`), se genera un slot virtual para la pista correspondiente calculando:
  - `startTime`: Fecha seleccionada + hora de inicio de la franja.
  - `endTime`: `startTime` + `facility.defaultSlotMinutes` (o 60/90 minutos por defecto).
  - Control de tiempo disponible: se valida que no sobrepase el cierre del club ni solape con un slot ocupado o bloqueado posterior.
- Abre la modal de confirmación con los datos preconfigurados listos para confirmar la reserva.

## Criterios de Aceptación (CA)
- **CA-1 (Granularidad Día/Semana/Mes):** El usuario puede conmutar entre vista Día, Semana y Mes mediante controles accesibles en la parte superior. Cada vista actualiza coherentemente el rango temporal y la disponibilidad.
- **CA-2 (Estilo Píldora en Slots Disponibles):** Los slots disponibles tienen fondo translúcido, borde rosa neón y precio en rosa neón sin saturación fluorescente sólida, con hover interactivo.
- **CA-3 (Reserva en Slot Vacío):** Al hacer clic en un slot vacío ('—'), se abre la modal de reserva para esa pista y hora, calculando la franja y validando que no exceda el tiempo disponible.
- **CA-4 (Validación de Tests y Build):** 100% de tests unitarios pasando y compilación sin errores.
- **CA-5 (Diseño Responsive & UX Mobile):** El layout superior y los controles de granularidad se adaptan fluidamente a smartphones y tablets sin romperse ni desbordar la pantalla, permitiendo scroll horizontal con columna fija en cuadrícula.
- **CA-6 (Iconos de Navegación Visibles):** Los botones de semana previa/siguiente y mes previo/siguiente renderizan visiblemente sus iconos `pi-chevron-left` y `pi-chevron-right`.
- **CA-7 (Bloqueo Temporal Antelación 2 Horas y Fechas Pasadas):** Queda bloqueada cualquier reserva cuyo horario de inicio sea menor a la hora actual más 2 horas (`now + 2 horas`) o en días pasados. Se visualizan deshabilitados/bloqueados y no permiten interacción.
