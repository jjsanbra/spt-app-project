# Propuesta: Spinner Global Centralizado y Limpieza de Spinners en Tablas

## 1. Contexto y Problema de Negocio
En entornos desplegados (preproducción en Render y Neon), se experimenta una latencia apreciable al cargar vistas y datos debido a dos factores:
1. *Cold starts* del backend y la base de datos por inactividad.
2. Descarga en red de los bundles de microfrontends remotos mediante Native Federation (`spt-admin`, `spt-portal`, `spt-users`).

Actualmente, las tablas de datos implementan individualmente la directiva `[loading]="loading"` de PrimeNG `p-table`. Esto genera una experiencia fragmentada: la pantalla se queda estática o en blanco mientras descarga el microfrontend, luego parpadea la página y finalmente aparece un spinner local dentro de cada tabla. El usuario percibe una carga a trompicones y poco fluida.

## 2. Solución Propuesta (Opción B: Overlay Centralizado)
1. **Servicio e Interceptor Global de Carga (`@core`):**
   - Implementar `LoadingService` basado en Signals de Angular con contador de peticiones activas concurrentes.
   - Implementar `loadingInterceptor` que capture automáticamente todas las llamadas HTTP a la API y sincronice el estado con `LoadingService`.
   - Conectar los eventos de navegación de `Router` (`NavigationStart`, `NavigationEnd`, `NavigationCancel`, `NavigationError`) en el Shell host (`spt-app`) para cubrir el tiempo de descarga de microfrontends remotos.
2. **Componente Overlay Global en el Shell (`spt-app`):**
   - Ubicar un overlay translúcido (`.global-loading-overlay`) sobre el contenedor principal `<main class="app-main">`.
   - Utilizar el componente oficial de PrimeNG `p-progress-spinner` estilizado con el color primario de marca (`--primary-color: #FF2D78`) y un texto claro internacionalizado (`COMMON.LOADING`).
   - Mantener el Sidebar y Topbar completamente funcionales y visibles sin bloqueo innecesario.
3. **Limpieza de Spinners Locales en Tablas:**
   - Retirar la propiedad `[loading]="loading"` de las 8 tablas de PrimeNG en `spt-admin` y `spt-portal` (`facilities-list`, `facility-blocks`, `pricing-list`, `club-members`, `club-settings`, `activity-logs`, `superadmin-clubs`, `user-activity`).
   - Mantener intacto el estado `loading` en los botones de envío de formularios (`[loading]="loading"`), que sí requieren feedback contextual.

## 3. Criterios de Aceptación (CA)
- **CA-01 (Overlay Global Activo en Navegación y HTTP):** Al navegar entre secciones o ejecutarse peticiones HTTP a la API, el contenedor `<main class="app-main">` debe mostrar el overlay translúcido con `<p-progress-spinner>` y texto de carga centrado.
- **CA-02 (Desaparición Suave):** Al finalizar todas las peticiones concurrentes y la navegación, el overlay debe desaparecer de inmediato revelando la vista completamente renderizada.
- **CA-03 (Sin Spinners Duplicados en Tablas):** Ninguna tabla `p-table` debe mostrar el spinner interno de PrimeNG (`[loading]`), evitando dobles indicadores de carga.
- **CA-04 (Feedback de Envío en Botones Preservado):** Los botones de acción y submit de formularios deben continuar mostrando su indicador de carga local cuando se ejecuta una mutación.
- **CA-05 (Pruebas Unitarias al 100%):** Todos los tests del Shell, Admin, Portal y Users deben pasar satisfactoriamente.
