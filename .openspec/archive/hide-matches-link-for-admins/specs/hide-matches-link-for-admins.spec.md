# Delta de Especificación: Ocultar Enlace "Mis Partidos" para Administradores

## 1. Reglas de Negocio (RN)

- **RN-01 (Exclusión de Perfiles de Gestión):** El enlace a "Mis Partidos" (`/portal/matches`) en el menú lateral principal no debe ser accesible ni visible para usuarios con roles de administración (Superadministrador o Administrador/Propietario de Club).
- **RN-02 (Disponibilidad para Jugadores y Socios):** Los usuarios con perfil de socio estándar (`MEMBER`) o invitado (`GUEST`) deben disponer del enlace "Mis Partidos" en el menú de navegación para acceder a sus partidos abiertos y reservas compartidas.
- **RN-03 (Reactividad Multi-tenant):** El cálculo de `canViewMatches` debe reaccionar automáticamente ante cambios de sesión y club activo (`authService.currentUser` y `authService.activeClub`).
- **RN-04 (Conformidad con PrimeNG en Sidebar):** La barra lateral debe estar orquestada obligatoriamente por el componente oficial `Drawer` (`DrawerModule`, `p-drawer`) de PrimeNG, sin contenedores `<aside>` ni backdrops artesanales.
- **RN-05 (Homologación Visual de Notificaciones):** La campana debe emplear `OverlayBadge` de PrimeNG con severidad semántica Stitch (`--primary`), y su desplegable (`Popover`) debe consumir tokens del Design System, evitando clases de utilidades no soportadas.
- **RN-06 (Persistencia de Ruta y Sesión en Recargas):** Al refrescar la aplicación con recarga dura del navegador en cualquier ruta autenticada, la sesión no debe destruirse por dependencias circulares y la URL debe mantenerse intacta.

## 2. Casos de Uso (CU)

### CU-01: Navegación de Superadministrador
- **Actor:** Superadministrador (`superadmin@spt-app.local`).
- **Flujo:**
  1. El superadministrador inicia sesión en la plataforma.
  2. En el sidebar izquierdo, visualiza la sección de Superadministración y las secciones operativas.
  3. En la sección "Jugador & Portal", visualiza "Reservas", "Mi Actividad" y "Mi Perfil".
  4. El enlace "Mis Partidos" **no está presente**.

### CU-02: Navegación de Director / Administrador de Club
- **Actor:** Director de Club (`admin@centralpadel.local`).
- **Flujo:**
  1. El administrador de club inicia sesión.
  2. En el sidebar visualiza la sección "Gestión del Club" (`/admin`).
  3. En la sección "Jugador & Portal", el enlace "Mis Partidos" **no está presente**.

### CU-03: Navegación de Socio
- **Actor:** Socio (`socio@spt-app.local`).
- **Flujo:**
  1. El socio inicia sesión en el portal.
  2. En el sidebar visualiza la sección "Jugador & Portal".
  3. El enlace "Mis Partidos" **está visible y accesible** entre "Reservas" y "Mi Actividad".

### CU-04: Apertura y Cierre de Sidebar en Móvil
- **Actor:** Cualquier usuario en dispositivo móvil (`<= 1024px`).
- **Flujo:**
  1. Al acceder a la aplicación, el sidebar permanece oculto fuera de vista.
  2. Al pulsar el botón de menú hamburguesa, el `p-drawer` de PrimeNG se abre con animación lateral y máscara de fondo oscurecida.
  3. Al seleccionar un enlace de navegación o pulsar fuera del área, el `p-drawer` se cierra automáticamente.

### CU-05: Consulta de Notificaciones y Homologación Visual
- **Actor:** Usuario autenticado.
- **Flujo:**
  1. Si existen notificaciones no leídas, la campana muestra una insignia `p-overlaybadge` con el color de marca Stitch.
  2. Al hacer clic en la campana, se despliega el `p-popover` de PrimeNG mostrando el listado con iconos semánticos según el tipo de notificación.

### CU-06: Recarga Dura de Página (F5) sin Pérdida de Sesión
- **Actor:** Usuario autenticado en vista protegida (ej: `/admin/pricing`).
- **Flujo:**
  1. El usuario pulsa recargar (F5 o Cmd+R) en el navegador.
  2. La aplicación inicializa sin errores `NG0200` y valida la sesión con el backend.
  3. El usuario permanece en `/admin/pricing` preservando su contexto y foco.

