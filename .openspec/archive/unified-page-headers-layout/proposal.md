# Propuesta de Cambio: Unificación de Layout de Cabeceras de Páginas (Page Headers)

## 📌 Contexto
Actualmente, las distintas vistas de los microfrontends (`spt-admin`, `spt-portal`, `spt-users`) presentan dispersión e inconsistencia en la estructura y maquetación de sus cabeceras (`page-header`):
1. **Reglas SCSS duplicadas:** Las clases `.page-header`, `.page-title`, `.page-subtitle`, `.header-titles` y `.header-actions` se encuentran repetidas y definidas de forma local en más de 10 archivos `.component.scss`.
2. **Inconsistencias estructurales:**
   - Vistas estándar usan `<div class="page-header">` o `<header class="page-header">`.
   - Vistas con navegación hacia atrás (`facility-blocks`) implementan enlaces de retorno de forma artesanal.
   - Vistas como `activity-logs` y `user-activity` encapsulan título y subtítulo dentro de un `<p-card>` con `<ng-template #title>`, rompiendo la coherencia visual con respecto a las demás pantallas del sistema.
   - En pantallas móviles o tablets, los comportamientos de wrap y alineación de botones difieren entre pantallas.

## 🎯 Problema de Negocio / UX
- **Experiencia de usuario fragmentada:** Un usuario percibe diferentes márgenes, alturas de títulos y comportamientos responsivos al saltar entre pistas, tarifas, miembros y logs.
- **Coste de mantenimiento:** Cualquier evolución visual en la cabecera (como unificación tipográfica, badges semánticos o breadcrumbs) requiere modificar manualmente decenas de archivos.
- **Violación de DRY y Design System:** Contraviene la directiva de arquitectura modular del Design System central descrita en `AGENTS.md`.

## 💡 Solución Propuesta
Desarrollar un componente standalone reutilizable y extensible **`PageHeaderComponent` (`<spt-page-header>`)** exportado de forma centralizada desde `@core` en `spt-app`, complementado por sus estilos canónicos en el Design System central (`apps/frontend/projects/spt-app/src/styles/components/_page-header.scss`).

### Capacidades del Componente Unificado:
1. **Información y jerarquía:**
   - `title`: Título de la página (soporta clave de traducción o texto traducido con `translate`).
   - `subtitle`: Subtítulo o descripción contextual.
   - `icon`: Icono opcional de PrimeNG (`pi pi-*`).
   - `badge`: Texto o tag de estado/entidad (ej: `— Pista 1 Central` o rol).
2. **Navegación contextual (Breadcrumb / Volver):**
   - `backUrl`: Enlace opcional de retorno (ej: `/admin/facilities`).
   - `backLabel`: Etiqueta del botón de regreso con icono de flecha.
3. **Acciones y Controles (Content Projection):**
   - Proyección de botones primarios/secundarios (`[actions]` o proyección por defecto) garantizando el uso de directivas PrimeNG (`pButton`).
   - Proyección de filtros o selectores contextuales (`[filters]` o controles asociados).
4. **Comportamiento Responsivo Oficial:**
   - En escritorio (`> 1024px`): Disposición en fila con justificación `space-between` y alineación centrada.
   - En tablet (`641px - 1024px`): Envoltura fluida manteniendo proporciones.
   - En móvil (`<= 640px`): Colapso en columna con acciones al ancho completo mediante `@include mobile`.

---

## 📋 Criterios de Aceptación (CA)

- [ ] **CA-1: Componente Reutilizable en `@core`:** Se crea `PageHeaderComponent` en `spt-app` y se exporta en `@core` con soporte para standalone imports en cualquier microfrontend.
- [ ] **CA-2: Design System Central:** Los estilos base se definen en `apps/frontend/projects/spt-app/src/styles/components/_page-header.scss` utilizando variables semánticas (`--font-heading`, `--font-size-xl`, `--spacing-lg`, `--border-subtle`) y mixins responsivos (`@include mobile`, `@include tablet`).
- [ ] **CA-3: Integración de Acciones y Controles:** El componente proyecta botones `pButton`, selects `p-select` y toolbars sin interferir en la reactividad ni en el ciclo de vida de los componentes hijos.
- [ ] **CA-4: Soporte de Navegación de Retorno:** Admite `backUrl` y `backLabel` renderizando un enlace de retroceso estilizado accesible.
- [ ] **CA-5: Homogeneización de Vistas Existentes:**
  - `spt-admin`: `facilities-list`, `facility-blocks`, `pricing-list`, `club-members`, `superadmin-clubs`, `activity-logs`.
  - `spt-portal`: `bookings-grid`, `my-bookings`, `open-matches`, `user-activity`.
- [ ] **CA-6: Pruebas Unitarias y Cobertura:** El componente cuenta con su correspondiente suite `.spec.ts` logrando >= 90% de cobertura.
- [ ] **CA-7: Sin Textos Hardcodeados:** Todas las etiquetas, tooltips y títulos se integran mediante `ngx-translate`.
