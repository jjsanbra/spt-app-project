# Proposal: hide-chrome-auth-pages

**Fecha:** 2026-10-22  
**Estado:** 🟢 Completado  
**Autor:** Antigravity AI  

---

## 1. Contexto y Motivación

Actualmente, el Shell principal de la aplicación (`spt-app`) muestra de forma persistente tanto el Sidebar lateral izquierdo (`aside.app-sidebar`) como la barra superior del encabezado (`header.app-topbar`) en todas las vistas de la aplicación, incluyendo las pantallas de acceso y autenticación (`/login`, `/register`).

En las pantallas de inicio de sesión y registro de usuarios:
- El sidebar lateral muestra accesos a enlaces de autenticación o secciones que no corresponden al flujo de autenticación, ocupando 280px de ancho fijo en pantallas de escritorio.
- La barra superior (header/navbar) muestra un botón de menú hamburguesa y el contexto de marca que interfieren con la presentación limpia y centrada requerida para una experiencia inmersiva de autenticación (Auth Flow).
- Se requiere que tanto el sidebar como la navbar del header permanezcan completamente ocultas en el login, registro y pantallas de acceso, permitiendo que la interfaz de acceso ocupe el 100% de la ventana en un diseño enfocado y pulido, con soporte para alternar tema (modo claro / oscuro).

---

## 2. Solución Propuesta

1. **Detección Reactiva de Rutas de Acceso en Shell (`App`):**
   - En [app.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/app/app.ts), introducir un signal reactivo `currentUrl` y una señal computada `isAuthPage = computed(() => ...)` que evalúe si la ruta activa corresponde a una vista de acceso (`/login`, `/register`).
   - Sincronizar el signal con los eventos `NavigationEnd` del enrutador de Angular y con el valor inicial de navegación.

2. **Renderizado Condicional del Layout Chrome en `app.html`:**
   - Envolver el Sidebar (`aside.app-sidebar`), el Backdrop móvil (`.sidebar-backdrop`) y la cabecera superior (`header.app-topbar`) con `@if (!isAuthPage()) { ... }`.
   - Si `isAuthPage()` es verdadero, omitir completamente dichos elementos del DOM visual.
   - En las vistas de acceso (`isAuthPage() === true`), proveer un botón discreto y flotante en la esquina superior para alternar el tema (dark/light) mediante `ThemeService`.

3. **Adaptación de Estilos CSS/SCSS en `app.scss`:**
   - Añadir la clase modificadora `.auth-layout` al contenedor `.app-layout` cuando `isAuthPage()` esté activo.
   - Configurar `.app-main-wrapper` y `.app-main` para ocupar el 100% de la pantalla (`min-height: 100vh; width: 100%`) sin márgenes ni offsets causados por el sidebar o header inexistentes.

---

## 3. Criterios de Aceptación (CA)

- [x] **CA-01:** En la ruta `/login`, ni el sidebar lateral izquierdo ni la barra superior (topbar/navbar) se muestran en pantalla.
- [x] **CA-02:** En la ruta `/register`, ni el sidebar lateral izquierdo ni la barra superior (topbar/navbar) se muestran en pantalla.
- [x] **CA-03:** Al navegar a una ruta protegida o autenticada (`/admin`, `/portal`, `/profile`), tanto el sidebar como la barra superior se muestran con normalidad y operatividad completa.
- [x] **CA-04:** En las pantallas de autenticación se mantiene accesible el selector de tema (claro/oscuro) para permitir una experiencia visual personalizada antes de iniciar sesión.
- [x] **CA-05:** La suite de pruebas unitarias (`npm test`) y la compilación global (`npm run build:all`) se ejecutan limpiamente sin regresiones.

---

## 4. Impacto Estimado

- **Backend:** 0 archivos (Sin impacto).
- **Base de datos:** 0 cambios. Riesgo NULO.
- **Frontend:** Modificación en el componente Shell de Angular (`app.ts`, `app.html`, `app.scss`, `app.spec.ts`).
- **Riesgo:** 🟢 Bajo (Mejora visual de presentación y diseño inmersivo de login/registro).
