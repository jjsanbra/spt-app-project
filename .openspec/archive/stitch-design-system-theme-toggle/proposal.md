# Proposal: stitch-design-system-theme-toggle

**Fecha:** 2026-10-22  
**Estado:** 🟢 Implementado (Completado y Verificado)  
**Autor:** Antigravity AI  
**Referencia Stitch:** [Sports Club Management Design System (Project 8260991373480520012)](https://stitch.withgoogle.com/projects/8260991373480520012)

---

## 1. Contexto y Motivación

El proyecto deportivo `spt-app-project` requiere una modernización visual integral basada en el sistema de diseño generado en Google Stitch (*Vibrant Neon Dark & Clean Light*). El objetivo principal es elevar la calidad estética a un estándar de alta gama, con contrastes definidos, micro-interacciones, tipografía moderna, un **layout de sidebar lateral izquierdo con contenido principal a la derecha**, y soporte fluido para **modo oscuro** (Dark Mode, tema insignia de Stitch) y **modo claro** (Light Mode), manteniendo **intacta toda la información, datos y lógica de negocio de las vistas existentes**.

Actualmente, el proyecto cuenta con estilos basados en una paleta clásica verde/esmeralda, una barra de navegación superior horizontal simple y PrimeNG configurado con `darkModeSelector: false`. La adopción del diseño de Stitch permitirá:
1. Una experiencia inmersiva en modo oscuro con acentos neón rosa (`#ff2d78`), cian (`#00ffcc` / `#24ffcd`) y ámbar (`#ffe04a`).
2. Una alternativa equilibrada en modo claro basada en superficies blancas, sutiles bordes slate (`#E2E8F0`) y detalles vibrantes.
3. Un **layout profesional de gestión deportiva con Sidebar lateral izquierdo** (`aside.app-sidebar`) que organiza intuitivamente la navegación de administración, portal de reservas, perfil, selección de club multi-tenant y cambio de tema, liberando el área principal (`main.app-main`) para los datos.
4. Consistencia total en el Shell (`spt-app`) y en todos los microfrontends (`spt-admin`, `spt-portal`, `spt-users`) a través del sistema de tokens central y componentes UI.

---

## 2. Solución Propuesta

La solución se divide en 5 pilares arquitectónicos:

1. **Tokens y Arquitectura de Estilos Dual (Dark & Light) en el Design System Central:**
   - Ampliar `apps/frontend/projects/spt-app/src/styles/base/_variables.scss` para soportar variables CSS dinámicas bajo `:root, [data-theme="light"]` y `[data-theme="dark"]`.
   - Incorporar la escala tonal de superficies y acentos de Stitch:
     - **Dark:** `--surface-pure: #111126`, `--surface-card: #1d1d33`, `--surface-container-high: #28283e`, `--surface-container-highest: #333349`, `--primary: #ff2d78`, `--secondary: #24ffcd`, `--on-surface: #e2e0fd`.
     - **Light:** `--surface-pure: #ffffff`, `--surface-card: #ffffff`, `--surface-container-high: #f8fafc`, `--border-subtle: #e2e8f0`, `--on-surface: #0f172a`.
   - Incorporar la jerarquía tipográfica de Stitch: encabezados con **Sora**, cuerpo con **Inter** y etiquetas/KPIs con **Space Grotesk** (mediante fuentes Google Fonts en `index.html`).

2. **Servicio Centralizado de Temas (`ThemeService` en `@core`):**
   - Servicio reactivo basado en Angular Signals (`currentTheme = signal<'dark' | 'light'>('dark')`).
   - Sincronización automática del atributo `data-theme` en `document.documentElement` y clase `.dark-theme`.
   - Persistencia de la preferencia del usuario en `localStorage` con fallback a la preferencia del sistema (`window.matchMedia('(prefers-color-scheme: dark)')`).

3. **Layout de Sidebar Lateral Izquierdo + Contenido Principal (`spt-app`):**
   - **Sidebar izquierdo (`aside.app-sidebar`):** Ancho fijo de 280px en escritorio (`--admin-sidebar-w`), que agrupa el logotipo con resplandor neón, selector de club activo, menú de navegación categorizado (Portal, Administración, Superadmin), monedero de saldo (€), botón de cambio de tema (sol/luna) y perfil de usuario con logout.
   - **Área principal a la derecha (`main.app-main`):** Header superior compacto con botón de menú móvil (`hamburguesa`), campana de notificaciones y renderizado de vistas mediante `<router-outlet>`.
   - **Comportamiento responsivo móvil/tablet:** El sidebar se transforma en menú deslizante (*off-canvas*) accesible mediante el botón hamburguesa con backdrop oscurecido.

4. **Sincronización con Framework PrimeNG:**
   - Configuración de `darkModeSelector: '[data-theme="dark"]'` en las aplicaciones (`app.config.ts`), garantizando que los componentes nativos de PrimeNG (tablas, calendarios, diálogos, dropdowns, inputs) adapten su tema Aura en sintonía con el modo de la aplicación.
   - Refactor de sobreescrituras en `_buttons.scss`, `_tables.scss`, `_cards.scss`, `_dialogs.scss`, `_badges.scss` y `_forms.scss` para consumir los nuevos tokens semánticos.

5. **Layouts y Vistas de Microfrontends (Estilos Scoped):**
   - Adaptación de los contenedores de página, encabezados, tarjetas de estadísticas y tablas en `spt-admin`, `spt-portal` y `spt-users`.
   - **Garantía estricta de no modificación de datos:** Ningún campo, columna de tabla, formulario ni binding de datos actual se eliminará ni alterará. Solo se enriquecen las clases CSS, contenedores visuales y estética.

---

## 3. Criterios de Aceptación (CA)

- [x] **CA-01:** Definición exhaustiva de tokens CSS de Stitch en `_variables.scss` tanto para modo oscuro (`[data-theme="dark"]`) como para modo claro (`[data-theme="light"]`), eliminando colores hardcodeados.
- [x] **CA-02:** Creación y exportación de `ThemeService` en `@core` con gestión de estado reactiva (Signals), persistencia en `localStorage` y detección inicial.
- [x] **CA-03:** Implementación del layout de Sidebar lateral izquierdo fijo en escritorio (280px) y deslizante (*off-canvas*) en móviles, con navegación agrupada, indicador de club y widget inferior de usuario/tema/wallet.
- [x] **CA-04:** Configuración de `darkModeSelector: '[data-theme="dark"]'` en los `app.config.ts` de los 4 proyectos frontend (`spt-app`, `spt-admin`, `spt-portal`, `spt-users`).
- [x] **CA-05:** Actualización de componentes base del Design System central (`buttons`, `cards`, `tables`, `badges`, `forms`, `dialogs`) reflejando la identidad visual de Stitch (bordes sutiles, sombras tonales, gradientes de acción neon pink).
- [x] **CA-06:** Adaptación de los layouts principales (`app.scss` del Shell y páginas de `spt-admin`, `spt-portal`, `spt-users`) utilizando mixins responsivos oficiales (`@include mobile`, etc.) sin `@media` manuales.
- [x] **CA-07:** Integración de Google Fonts (`Sora`, `Inter`, `Space Grotesk`) centralizada en el Shell Host ([spt-app/src/index.html](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/index.html)).
- [x] **CA-08:** Preservación del 100% de la funcionalidad, formularios, columnas de tablas y datos existentes en todas las vistas.
- [x] **CA-09:** Textos, etiquetas y tooltips gestionados a través de `ngx-translate` en `es.json`.
- [x] **CA-10:** Pruebas unitarias para `ThemeService` y componentes modificados, manteniendo la cobertura global por encima del 80%.

---

## 4. Impacto Estimado

- **Backend:** 0 archivos (Sin impacto ni dependencias backend).
- **Base de datos:** 0 cambios. Riesgo NULO (no se modifica esquema ni tablas).
- **Frontend:**
  - `@core`: Nuevo `ThemeService` con tests.
  - `spt-app`: `_variables.scss`, componentes centralizados de estilos, nuevo layout con Sidebar en `app.html` / `app.scss`, `app.config.ts`, `index.html`.
  - `spt-admin`, `spt-portal`, `spt-users`: `app.config.ts`, `index.html` y estilos específicos de vistas (`.component.scss`).
- **Riesgo:** 🟢 Bajo (Cambio acotado a la capa visual y de presentación, sin lógica destructiva ni alteración de contratos de API).

---

## 5. Dependencias

- Ninguna dependencia técnica bloqueante previa.
- Aprobación explícita del plan por parte del usuario antes de iniciar la implementación.
