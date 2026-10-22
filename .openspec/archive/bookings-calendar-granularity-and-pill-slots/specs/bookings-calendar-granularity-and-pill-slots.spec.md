# Delta de Especificación: Granularidad Temporal, Slots Píldora Neón y Reserva en Vacíos

## 1. Alcance
Afecta a la pantalla de disponibilidad y cuadrícula de reservas `bookings-grid` en el microfrontend `spt-portal` y sus claves de traducción en `spt-app/src/assets/i18n/es.json`.

## 2. Requerimientos Funcionales y de UI

### RF-01: Estilos de Slots Estilo Píldora Neón
- Los slots disponibles (`AVAILABLE`) deben presentarse como etiquetas/píldoras redondeadas con fondo semitransparente con tinte rosado (`rgba(255, 45, 120, 0.12)`), borde fino rosa (`rgba(255, 45, 120, 0.40)`) y precio en color rosa neón (`var(--primary-color)`).
- Debe eliminar la apariencia de bloque rectangular sólido y saturado.
- Al pasar el cursor por encima (hover), debe intensificar levemente el fondo y emitir un resplandor glow sutil.

### RF-02: Reserva en Celdas Vacías
- Las celdas sin slot pregenerado deben ser clicables e indicar visualmente la posibilidad de reserva mediante cursor tipo pointer y hover contrastado.
- Al pulsar una celda vacía para una pista determinada, el sistema debe abrir la modal de confirmación con la hora calculada a partir de la franja y la duración por defecto de la pista (`facility.defaultSlotMinutes`).
- Debe asegurarse de que la hora calculada no exceda los horarios de operación permitidos ni solape con franjas ya ocupadas o bloqueadas.

### RF-03: Conmutador de Granularidad Temporal
- La barra de filtros superior debe permitir alternar entre 3 escalas de granularidad: Día, Semana y Mes.
- En vista **Día**, se muestra la matriz horaria diaria por pistas (horario vs pistas).
- En vista **Semana**, se muestra el cuadrante semanal de la pista seleccionada o destacada frente a los 7 días (Lunes a Domingo), con navegación por semanas.
- En vista **Mes**, se muestra una vista mensual de calendario para consultar días y saltar a una fecha directamente.
- Todas las etiquetas de UI deben utilizar `ngx-translate`.

### RF-04: Diseño Responsive y Experiencia Mobile
- El encabezado y la barra de filtros deben estructurarse de forma jerárquica y limpia, adaptándose a dispositivos móviles mediante los mixins responsivos del sistema de diseño (`@include mobile`, `@include tablet`).
- En dispositivos móviles o pantallas compactas, los controles deben apilarse ordenadamente con tamaños táctiles accesibles (mínimo 40-44px).
- La cuadrícula de horarios debe disponer de desplazamiento horizontal suave (`overflow-x: auto`) manteniendo fija la columna de horas (`sticky left: 0`).

### RF-05: Iconos de Navegación Explícitos
- Los botones de navegación previa/siguiente en vista Semana y Mes deben incluir explícitamente elementos de icono PrimeIcons (`pi pi-chevron-left` y `pi pi-chevron-right`) garantizando visibilidad en todos los navegadores y resoluciones.

### RF-06: Bloqueo de Reservas Pasadas y con Menos de 2 Horas de Antelación
- Queda estrictamente bloqueada cualquier reserva cuya fecha y hora de inicio sea anterior al instante actual más un margen de 2 horas (`slotDateTime < now + 2 horas`).
- Los slots pasados o con menos de 2 horas de margen deben mostrarse con estilo deshabilitado/bloqueado (`.slot-cutoff-blocked`), con cursor `not-allowed`, y no deben permitir la apertura de la modal de reserva ni la confirmación de la misma.
