# Delta de Especificación: hide-chrome-auth-pages

**Fecha:** 2026-10-22  
**Módulo:** `spt-app` (Shell Host)  
**Alcance:** Ocultamiento del Sidebar y Navbar en vistas de acceso (`/login`, `/register`).  

---

## 1. Reglas de Negocio y Comportamiento de UI

### RN-AUTH-CHROME-01: Ocultamiento de Elementos de Navegación en Acceso
- Cuando la ruta activa sea `/login` o `/register` (con o sin parámetros de consulta como `?returnUrl=...`), el Sidebar lateral izquierdo (`app-sidebar`), el Backdrop móvil (`sidebar-backdrop`) y la cabecera superior (`app-topbar`) no se renderizarán en la interfaz.
- La zona principal de la pantalla debe ocupar la totalidad del ancho y alto del viewport (100vw / 100vh), permitiendo que la tarjeta de inicio de sesión o registro se ubique en el centro sin desplazamientos laterales ni barra superior superpuesta.

### RN-AUTH-CHROME-02: Disponibilidad del Selector de Tema
- En las vistas donde el Sidebar y la Navbar estén ocultos (`isAuthPage() === true`), se renderizará un botón flotante estilizado para el selector de tema (`ThemeService.toggleTheme()`) en la esquina superior derecha.
- Al alternar el tema, la pantalla de autenticación transicionará fluidamente entre modo oscuro y modo claro utilizando los tokens del sistema de diseño Stitch.

### RN-AUTH-CHROME-03: Restauración en Vistas Autenticadas
- Al completar la autenticación o navegar a cualquier ruta protegida o del portal (`/portal`, `/admin`, `/profile`), el Sidebar y la cabecera superior se restaurarán automáticamente.
