# Tasks: stitch-design-system-theme-toggle

**Fecha:** 2026-10-22  
**Estado:** ✅ Completado (Sistema de diseño Stitch, Layout Sidebar lateral izquierdo, ThemeService dual Dark/Light y estilos aplicados con éxito)  

---

## Fase 1: Fundamentos y Tokens de Diseño Stitch (Dark & Light)

- [x] **TASK-01**: Integrar Google Fonts (`Sora`, `Inter`, `Space Grotesk`) en el Shell Host ([spt-app/src/index.html](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/index.html)), centralizando la carga de fuentes para todos los microfrontends.
- [x] **TASK-02**: Actualizar `apps/frontend/projects/spt-app/src/styles/base/_variables.scss` con el mapeo completo de tokens Stitch:
  - Definir bloque `:root, [data-theme="light"]` con los valores de superficie, texto, acentos y bordes claros de Stitch.
  - Definir bloque `[data-theme="dark"]` con la paleta Vibrant Neon Dark (`#111126`, `#1d1d33`, `#28283e`, `#ff2d78`, `#24ffcd`, etc.).
  - Definir variable de ancho del sidebar `--admin-sidebar-w: 280px` y sombras tonales.
  - Definir variables tipográficas para familias Sora, Inter y Space Grotesk.
  - Mantener retrocompatibilidad con los tokens existentes usados en componentes.

## Fase 2: Servicio Central de Gestión de Tema (`@core`)

- [x] **TASK-03**: Crear `ThemeService` en `apps/frontend/projects/spt-app/src/app/core/services/theme.service.ts`:
  - Señal reactiva `currentTheme = signal<'dark' | 'light'>('dark')`.
  - Método `toggleTheme()` y `setTheme(theme: 'dark' | 'light')`.
  - Detección de tema almacenado en `localStorage` ('spt-theme') con fallback a preferencia del sistema operativo (`prefers-color-scheme`).
  - Aplicación del atributo `data-theme` y clase `dark-theme` en `document.documentElement`.
- [x] **TASK-04**: Exportar `ThemeService` en el barril público de `@core` (`index.ts`).
- [x] **TASK-05**: Crear pruebas unitarias exhaustivas para `ThemeService` (`theme.service.spec.ts`) validando cambio de señal, persistencia en `localStorage` y mutación del DOM (cobertura > 90%).

## Fase 3: Layout de Sidebar Lateral Izquierdo + Shell Global y Configuración PrimeNG

- [x] **TASK-06**: Configurar `darkModeSelector: '[data-theme="dark"]'` en los 4 archivos `app.config.ts`:
  - `apps/frontend/projects/spt-app/src/app/app.config.ts`
  - `apps/frontend/projects/spt-admin/src/app/app.config.ts`
  - `apps/frontend/projects/spt-portal/src/app/app.config.ts`
  - `apps/frontend/projects/spt-users/src/app/app.config.ts`
- [x] **TASK-07**: Implementar el Layout de Sidebar Lateral Izquierdo en el Shell (`apps/frontend/projects/spt-app/src/app/app.html` y `app.scss`):
  - **Sidebar (`aside.app-sidebar`) fijo a la izquierda (280px en escritorio):**
    - Marca / Logo deportivo con icono neón y badge de club activo multi-tenant.
    - Secciones de navegación con iconos y enlaces: Portal de Reservas, Perfil, Panel Admin (Pistas, Bloqueos, Tarifas, Socios, Configuración) y Superadmin.
    - Footer del Sidebar: Perfil de usuario autenticado, saldo de monedero (€), botón selector de tema (sol/luna) y botón de cierre de sesión.
  - **Barra superior compacta (`header.app-topbar`):**
    - Botón hamburguesa accesible para abrir/cerrar sidebar en móviles/tablets con directiva `pButton`.
    - Campana de notificaciones (`app-notification-bell`).
  - **Contenedor principal (`main.app-main`):**
    - Área con scroll vertical independiente donde se renderiza `<router-outlet>`.
  - **Comportamiento responsivo:**
    - Escritorio (`@include desktop`): Sidebar visible de forma fija.
    - Móvil/Tablet (`@include mobile-or-tablet`): Sidebar transformado en menú deslizante (*off-canvas*) con backdrop.
- [x] **TASK-08**: Registrar claves i18n para el sidebar y toggle de tema en `es.json` (`THEME.TOGGLE_LIGHT`, `THEME.TOGGLE_DARK`, `NAV.SIDEBAR_OPEN`, `NAV.SIDEBAR_CLOSE`).

## Fase 4: Modernización de Componentes del Design System Central

- [x] **TASK-09**: Actualizar `_buttons.scss` con el botón principal neon pink (`#ff2d78`), botón secundario con bordes sutiles y estilos de acción de PrimeNG.
- [x] **TASK-10**: Actualizar `_tables.scss` con estilos temáticos de `p-table` para cabeceras (`Space Grotesk`, `--surface-container-high`), filas con transiciones suaves y estados vacíos.
- [x] **TASK-11**: Actualizar `_cards.scss` con esquinas redondeadas (`--radius-lg`), bordes sutiles y resplandores tonales adaptados a modo oscuro y claro.
- [x] **TASK-12**: Actualizar `_badges.scss`, `_dialogs.scss` y `_forms.scss` para que consuman los tokens semánticos reactivos a `data-theme`.

## Fase 5: Estilización de Vistas de Microfrontends (Preservando 100% de Información)

- [x] **TASK-13**: Ajustar estilos en vistas de Administración (`spt-admin`):
  - `facilities-list`: Contenedor, buscador/filtros, tabla y modal de pistas con diseño Stitch.
  - `facility-blocks`: Tablas y badges de bloqueos.
  - `pricing-list`: Tarjetas y tablas de tarifas y reglas de precios.
  - `club-members`: Lista de socios, roles y estados.
  - `dashboard`: Tarjetas KPI y accesos rápidos.
  - *Garantía:* Sin alterar propiedades, columnas, llamadas a API ni datos mostrados.
- [x] **TASK-14**: Ajustar estilos en vistas de Portal (`spt-portal`):
  - `court-schedule` / `booking-wizard`: Rejilla horaria con estados de pista y franjas con look Stitch.
  - `open-matches`: Tarjetas de partidos y visualización de plazas.
- [x] **TASK-15**: Ajustar estilos en vistas de Usuarios (`spt-users`):
  - `login` y `register`: Tarjeta central de autenticación con fondo de cristal y acentos Stitch.

## Fase 6: Validación de Calidad y Tests

- [x] **TASK-16**: Ejecutar suite completa de tests de Backend y Frontend (`npm test`) verificando que todos los tests pasen (304+ tests) y que la cobertura se mantenga sobre el 80%.
- [x] **TASK-17**: Validar compilación limpia de todos los proyectos (`npm run build:all`).
- [x] **TASK-18**: Sincronizar CodeGraph con `npm run codegraph:sync`.
