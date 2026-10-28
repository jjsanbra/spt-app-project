# Delta de Especificación Funcional: Selector de Club en Topbar y Modal de Cambio de Club con Buscador

## 1. Visión General
Esta especificación define el rediseño del contexto multi-tenant en el Shell de la plataforma: se elimina la tarjeta del club activo del sidebar lateral, se traslada y resalta el club activo y su ciudad en la barra superior (topbar), y se introduce una ventana modal con buscador reactivo para alternar de forma inmediata entre los distintos clubes a los que pertenece el usuario.

---

## 2. Requerimientos Funcionales

### RF-1: Retirada de la Tarjeta de Club en el Sidebar
1. La barra lateral (`p-sidebar`) dejará de mostrar la tarjeta `sidebar-club-card`.
2. El flujo vertical de la barra lateral conectará la sección de marca superior (`sidebar-header`) de manera limpia con el menú de navegación (`sidebar-nav`).

### RF-2: Presentación del Club Activo y Localidad en el Topbar
1. El contenedor `.topbar-context` en la barra superior (`app-topbar`) mostrará el club activo con mayor jerarquía visual:
   - Nombre del club en tipografía destacada (`var(--font-size-md)`, `var(--font-weight-semibold)`).
   - Indicador de ciudad (`clubCity`), acompañado de un icono de chincheta/ubicación (`pi pi-map-marker`), cuando el club tenga ciudad configurada.
2. Si el usuario no tiene club activo o no está autenticado, se mantiene el tagline genérico o estado vacío.

### RF-3: Botón de Cambio de Club en el Topbar
1. Junto al nombre y ciudad del club se renderizará un botón PrimeNG con directiva `pButton` y tamaño `size="small"` (`pi pi-sync`).
2. Texto del botón: traducción de `USERS.CHANGE_CLUB` ("Cambiar de club").
3. Solo se mostrará a usuarios autenticados con membresías activas.
4. Al hacer clic, activará la visibilidad del modal de selección y reseteará el término de búsqueda.

### RF-4: Modal de Clubes Disponibles (`p-dialog`) con Buscador en Tiempo Real
1. Diálogo modal centrado con backdrop opaco y cierre accesible (`p-dialog`).
2. Título del modal: `USERS.CHANGE_CLUB_MODAL_TITLE` ("Seleccionar Club").
3. **Buscador en tiempo real:**
   - Campo `p-iconfield` con icono `pi pi-search` e input `pInputText`.
   - Placeholder traducido: `USERS.SEARCH_CLUB_PLACEHOLDER` ("Buscar por nombre o ciudad...").
   - Filtrado insensible a mayúsculas/minúsculas sobre `clubName` y `clubCity`.
   - Si no hay coincidencias, muestra mensaje amigable `USERS.NO_CLUBS_FOUND`.
4. Cada tarjeta de club en la lista mostrará:
   - Icono distintivo (`pi pi-building`).
   - Nombre del club y ciudad (`pi pi-map-marker`).
   - Tag de rol (`p-tag`) con severidad adaptada (ej: `OWNER` con `danger` o `contrast`, `ADMIN`/`STAFF` con `info`, `MEMBER` con `secondary`).
   - Si coincide con el club activo actual:
     - Borde destacado con token primario.
     - Badge o Tag de "Activo" (`severity="success"`).
   - Si no es el activo:
     - Botón de acción `pButton` con texto `COMMON.SELECT` ("Seleccionar").

### RF-5: Lógica de Activación y Salvaguarda de Rutas
1. Al seleccionar un nuevo club:
   - Se invoca `authService.setActiveClub(club)`.
   - Se persiste el ID del club seleccionado en `localStorage`.
   - Se emite una notificación de éxito mediante `NotificationService`.
   - Se cierra la ventana modal y se resetea el buscador.
2. Si la ruta actual es administrativa (`/admin/*`) y en el club seleccionado el usuario tiene rol de jugador o carece de privilegios administrativos, se redirige automáticamente a `/portal`.

---

## 3. Casos de Uso

### CU-1: Usuario con un único club
- El topbar muestra el nombre del club y su ciudad.
- El botón de cambio de club permanece oculto si solo tiene 1 membresía, o abre el diálogo indicando su sede actual.

### CU-2: Búsqueda reactiva en modal
- Un socio con 5 clubes abre la modal.
- Escribe "Madrid" en el buscador.
- La lista filtra instantáneamente mostrando solo los clubes ubicados en Madrid.
- Al pulsar "Seleccionar", se activa el club elegido y se cierra el diálogo.
