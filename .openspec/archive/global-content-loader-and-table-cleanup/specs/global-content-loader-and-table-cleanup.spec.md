# Especificación: Spinner Global Centralizado y Limpieza de Spinners en Tablas

## 1. Reglas de Negocio y Casos de Uso

### 1.1 Ciclo de Vida del Indicador Global
- **CU-01 (Navegación de Rutas):** Al emitirse el evento `NavigationStart` del router de Angular, el overlay de carga se activa (`isLoading = true`). Al emitirse `NavigationEnd`, `NavigationCancel` o `NavigationError`, el estado de navegación finaliza.
- **CU-02 (Peticiones HTTP Concurrentes):** Cada petición HTTP que no declare la cabecera `X-Skip-Loading` incrementa el contador de peticiones activas. El overlay permanece visible hasta que todas las peticiones concurrentes completan (`200 OK`, error de red, o timeout).
- **CU-03 (Presentación Visual):** El overlay cubre el contenedor `<main class="app-main">` con fondo translúcido y desenfoque sutil (`backdrop-filter: blur(4px)`), mostrando el componente `p-progress-spinner` centrado con el color de marca Stitch y la etiqueta "Cargando...".

### 1.2 Limpieza de Tablas PrimeNG
- **CU-04 (Tablas sin Spinner Local):** Las tablas de `spt-admin` y `spt-portal` no utilizan la directiva `[loading]="loading"`, eliminando el spinner grisáceo y el bloqueo interno propio de `p-table`.
- **CU-05 (Conservación de Loading en Botones):** Los botones de guardado, actualización y login mantienen la propiedad `[loading]="loading"` para feedback háptico/visual del envío del formulario.
