# Delta de Especificación Funcional: Unificación Global de Layouts, Cabeceras y Tablas al Modelo de Instalaciones

## 1. Visión General
Esta especificación define el estándar unificado y universal de presentación para todas las vistas principales de la plataforma multi-tenant, tomando como modelo canónico la pantalla de **Gestión de Pistas e Instalaciones** (`facilities-list`).

---

## 2. Requerimientos Funcionales

### RF-1: Contenedor Universal de Pantalla (1400px)
Toda pantalla de primer nivel o módulo debe contenerse dentro de una clase de página con las siguientes directivas:
1. **Ancho máximo:** `max-width: 1400px` centrado con `margin: 0 auto`.
2. **Espaciados estándar en Escritorio (`> 1024px`):**
   - Relleno vertical y horizontal: `padding: var(--spacing-xl) var(--spacing-lg)`.
3. **Espaciados estándar en Móvil (`<= 640px`):**
   - Relleno reducido: `padding: var(--spacing-md) var(--spacing-sm)`.
4. **Ancho disponible:** `width: 100%`, `box-sizing: border-box`.

### RF-2: Implementación Universal de la Cabecera Compartida (`spt-page-header`)
1. **Obligatoriedad:** Queda prohibida la inclusión de cabeceras locales o maquetaciones ad-hoc con etiquetas nativas `<header>` o `<div class="page-header">`.
2. **Propiedades estándar:**
   - `[title]`: Clave i18n traducida o texto descriptivo del módulo.
   - `[subtitle]`: Clave i18n traducida con la descripción contextual.
   - `[icon]`: Icono contextual PrimeIcons (ej: `pi pi-th-large`, `pi pi-history`, `pi pi-calendar`).
   - `[backUrl]` / `[backLabel]`: Para submódulos dependientes (ej: bloqueos de pista).
3. **Estilo del Icono en Cabecera (`.header-icon-badge`):**
   - El icono se presenta dentro de un contenedor cuadrado redondeado (52x52px en desktop, 44x44px en mobile).
   - Fondo con degradado corporativo (`var(--primary-gradient)`), radio `var(--radius-lg)` y resplandor `var(--shadow-glow-pink)`.
   - Icono blanco centrado (`color: #ffffff`).
   - Separación horizontal respecto al bloque de texto con margen derecho `var(--spacing-2xl)`.
4. **Acciones Contextuales (`<div actions>`):**
   - Los botones primarios o secundarios de la pantalla deben proyectarse en `<div actions>`.
   - Deben utilizar la directiva `pButton` de PrimeNG con el tamaño estandarizado `size="large"` (en desktop).
5. **Etiqueta de Cierre:** Debe utilizarse obligatoriamente el formato explícito `<spt-page-header ...></spt-page-header>`.

### RF-3: Presentación de Tablas (`.table-card` y `p-table`)
1. **Contenedor:** La tabla debe estar envuelta en un contenedor `<div class="table-card">` que garantice bordes redondeados (`var(--radius-lg)`), borde sutil (`var(--border-subtle)`), fondo de tarjeta (`var(--surface-card)`) y sombra homogénea (`var(--shadow-table)`).
2. **Ancho de visualización:** La tabla debe expandirse al 100% del contenedor de 1400px, asegurando legibilidad sin compresiones artificiales.
3. **Filas alternas:** Activar `[stripedRows]="true"` para mejorar el escaneo visual de datos.
4. **Paginación estándar:**
   - `[paginator]="true"`
   - `[rows]="10"`
   - `[rowsPerPageOptions]="[5, 10, 20, 50]"`
   - `[showCurrentPageReport]="true"`
   - `[currentPageReportTemplate]="'COMMON.PAGE_REPORT' | translate"`
5. **Columna de Acciones:** Situada como última columna con clase `text-right` y ancho explícito de cabecera (`style="width: 8rem"` o `6rem`), utilizando botones `iconOnly` redondeados y variantes de texto.

### RF-4: Barras de Herramientas y Filtros
1. **Estilo de Tarjeta:** Las barras de búsqueda y filtros previas a la tabla deben utilizar contenedor con fondo `var(--surface-card)` y bordes sutiles.
2. **Separación Vertical:** Deben incluir `margin-bottom: var(--spacing-lg)` para mantener el ritmo visual hacia la tabla.
3. **Controles Homologados:** Los campos de búsqueda `p-iconfield` y selectores `p-select` deben mantener tamaño `size="large"`.

---

## 3. Casos de Uso Específicos por Pantalla

### CU-1: Pantallas Maestras de Administración (`facilities-list`, `pricing-list`, `club-members`, `superadmin-clubs`)
- Contenedor a 1400px.
- Cabecera `<spt-page-header>` con botón de creación en `<div actions>`.
- Tabla encapsulada en `.table-card` ocupando el 100% del ancho.

### CU-2: Registro de Actividad (`activity-logs`, `user-activity`)
- Contenedor a 1400px.
- Cabecera `<spt-page-header>` con título y subtítulo traducidos.
- Barra de filtros con `margin-bottom: var(--spacing-lg)`.
- Tabla de eventos ocupando el 100% de los 1400px en `.table-card`.

### CU-3: Configuración del Club (`club-settings`)
- Contenedor a 1400px (`.admin-page-container`).
- Sustitución de cabecera HTML manual por `<spt-page-header>` con el botón de guardar en `<div actions>`.

### CU-4: Cuadrícula y Reservas del Portal (`bookings-grid`, `my-bookings`, `open-matches`)
- Ampliación del contenedor de 1200px a 1400px para maximizar la visibilidad de pistas simultáneas y fechas en el calendario.
- Homogeneización de paddings con el modelo de instalaciones.
