# Propuesta de Cambio: Unificación Global de Layouts, Cabeceras y Tablas al Modelo de Instalaciones

## 📌 Contexto
En la actualidad, las pantallas de los tres microfrontends de la plataforma (`spt-admin`, `spt-portal` y `spt-users`) presentan disparidades significativas en su maquetación estructural:
1. **Dispersión en anchos máximos (`max-width`):** La vista de gestión de pistas e instalaciones (`facilities-list`) utiliza un ancho de `1400px` con paddings consistentes (`var(--spacing-xl) var(--spacing-lg)` en escritorio y `var(--spacing-md) var(--spacing-sm)` en móvil). Sin embargo, vistas del Portal (`bookings-grid`, `my-bookings`, `user-activity`) están limitadas a `1200px`, y otras pantallas usan clases ad-hoc (`.activity-logs-container`, `.superadmin-page-container`, `.profile-container`).
2. **Inconsistencias en la cabecera común (`<spt-page-header>`):** Mientras que `facilities-list` y `pricing-list` utilizan la cabecera compartida con proyección de acciones (`<div actions>`) y etiquetas de cierre explícitas, pantallas como `club-settings` mantienen una cabecera HTML artesanal (`<div class="page-header">`), y `activity-logs` utiliza etiquetas autocerradas sin acciones.
3. **Anchos y encapsulación de tablas (`.table-card`):** El modelo de referencia (`facilities-list`) sitúa la tabla dentro de una tarjeta `.table-card` ocupando el 100% del contenedor `1400px`, con espaciado vertical estandarizado, paginación PrimeNG unificada (`[paginator]="true" [rows]="10" [rowsPerPageOptions]="[5, 10, 20, 50]"`), y columna de acciones fijada a la derecha. Otras pantallas presentan desalineaciones o estilos fragmentados.

## 🎯 Problema de Negocio / UX
- **Experiencia de usuario desigual:** Los usuarios (administradores y socios) experimentan "saltos" de ancho y alineación al navegar entre pantallas de gestión (pistas a 1400px vs reservas a 1200px).
- **Incoherencia visual:** Elementos comunes como títulos, subtítulos, botones de acción principal y filtros flotan con distintas separaciones y márgenes entre páginas.
- **Mantenibilidad:** La duplicación de definiciones de contenedores de página (`.admin-page-container`, `.portal-page-container`, `.activity-logs-container`, etc.) viola el principio DRY y las directivas del Design System central descritas en `AGENTS.md`.

## 💡 Solución Propuesta
Homologar todas las vistas de la aplicación tomando como referencia el modelo canónico de **Gestión de Pistas e Instalaciones** (`facilities-list`):
1. **Clase y Tokens de Contenedor Unificados:**
   - Estandarizar la clase base de contenedor (`.page-container` o `.admin-page-container` / `.portal-page-container`) con `max-width: 1400px`, centrado automático `margin: 0 auto`, y espaciados estándar:
     - Escritorio (`> 1024px`): `padding: var(--spacing-xl) var(--spacing-lg)`.
     - Móvil (`<= 640px`): `padding: var(--spacing-md) var(--spacing-sm)`.
2. **Uso Universal de `<spt-page-header>`:**
   - Sustituir cabeceras manuales (ej: `club-settings`) por `<spt-page-header>`.
   - Proyectar los botones de acción contextuales en el slot `<div actions>` con directiva `pButton` y tamaño estándar.
   - Eliminar iconos en el título de vistas de usuario final / socio, reservando la coherencia visual del layout.
   - Asegurar etiqueta de cierre explícita `</spt-page-header>`.
3. **Estandarización de Tablas (`.table-card` y `p-table`):**
   - Encapsular todas las tablas de datos en `.table-card` al 100% del ancho del contenedor (`1400px`).
   - Estandarizar configuración de paginador PrimeNG, filas alternas (`[stripedRows]="true"`) y alineación de acciones.
4. **Homologación de Barras de Filtros y Búsqueda:**
   - Alinear las barras de herramientas (`.filters-toolbar` / `.filters-bar`) con tarjeta de fondo `var(--surface-card)`, bordes sutiles y márgenes inferiores estándar (`margin-bottom: var(--spacing-lg)`).

---

## 📋 Criterios de Aceptación (CA)

- [ ] **CA-1: Ancho Máximo y Espaciados Canónicos (1400px):** Todas las vistas principales de la aplicación (`spt-admin`, `spt-portal`, `spt-users`) adoptan el ancho máximo estándar de `1400px` centrado con padding `var(--spacing-xl) var(--spacing-lg)` (escritorio) y `var(--spacing-md) var(--spacing-sm)` (móvil).
- [ ] **CA-2: Cabecera Común `<spt-page-header>` en Toda la App:** Ninguna pantalla implementa cabeceras manuales o ad-hoc. Vistas como `club-settings` migran a `<spt-page-header>` con proyección de botones de guardado en `<div actions>`.
- [ ] **CA-3: Ancho Completo de Tablas y Tarjeta `.table-card`:** Todas las tablas de datos (`facilities-list`, `facility-blocks`, `pricing-list`, `club-members`, `superadmin-clubs`, `activity-logs`, `user-activity`) se encuadran en `.table-card` aprovechando el ancho de 1400px.
- [ ] **CA-4: Paginación y Controles de Tabla Homologados:** Todas las tablas comparten la configuración de paginación PrimeNG con selector de 5, 10, 20, 50 registros y reporte traducido en español (`COMMON.PAGE_REPORT`).
- [ ] **CA-5: Homogeneización de Barras de Filtros:** Las barras de filtros de logs, miembros y clubes comparten el mismo margen inferior (`var(--spacing-lg)`) y altura de controles.
- [ ] **CA-6: Integridad de Pruebas Unitarias:** El 100% de las suites de tests unitarios de frontend (`spt-admin`, `spt-portal`, `spt-users`, `spt-app`) compilan y pasan exitosamente sin regresiones.
