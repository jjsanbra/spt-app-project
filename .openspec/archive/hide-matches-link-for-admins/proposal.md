# Propuesta: Mejoras de Shell - Ocultación Mis Partidos, Refactor a PrimeNG Drawer, Homologación Notificaciones y Persistencia en Reload

## 1. Contexto y Problema de Negocio
En el Shell principal de la aplicación (`spt-app`), se han detectado varias inconsistencias arquitecturales y de experiencia de usuario:
1. **Enlace "Mis Partidos" expuesto a administradores:** En el menú lateral de navegación (`app.html`), el enlace `/portal/matches` aparecía visible para Superadministradores y Administradores de Club (`OWNER`, `ADMIN`), quienes no deben tener dicho acceso ya que su operativa es de gestión deportiva o global.
2. **Sidebar manual no conforme con PrimeNG:** La barra lateral de navegación utiliza un `<aside class="app-sidebar">` y un backdrop manuales, contraviniendo la directiva de desarrollo que exige el uso de los componentes oficiales de la librería PrimeNG (`Drawer` / `p-drawer`).
3. **Desalineación visual en Notificaciones:** El badge y el menú desplegable de notificaciones (`NotificationBellComponent`) poseen estilos y clases ajenas (clases Tailwind no soportadas y badges con severidades desalineadas con la paleta Stitch), faltando a la coherencia visual del Design System.
4. **Pérdida de sesión y foco en recarga (F5):** Al recargar cualquier vista protegida (como `/admin/pricing` o `/portal/book`), se producía una inyección circular `NG0200` entre `AuthService` y `authInterceptor`, haciendo fallar la verificación de sesión y redirigiendo obligatoriamente al login.

## 2. Solución Propuesta
1. **Ocultación reactiva de Mis Partidos:** Señal computada `canViewMatches` en `App` que oculta `/portal/matches` si el usuario es Superadmin o Administrador/Propietario de club.
2. **Refactorización a PrimeNG `p-drawer`:** Reemplazo del `<aside>` y backdrop ad-hoc por el componente oficial `<p-drawer>` de PrimeNG (`DrawerModule`), configurado de forma responsive (deslizante con backdrop nativo en móvil/tablet y estático fijado en escritorio mediante variables de diseño).
3. **Homologación de Notificaciones (PrimeNG + Stitch):**
   - Implementación de `<p-overlaybadge>` de `OverlayBadgeModule` para encapsular el botón campana.
   - Homologación de estilos del popover (`<p-popover>`) y píldoras (`<p-badge>`) con los tokens de diseño de `_variables.scss` (`--primary`, `--surface-card`, `--border-subtle`).
   - Sustitución de clases Tailwind por utilidades semánticas del Design System para iconos por tipo de notificación.
4. **Resolución de la Inyección Circular NG0200 y Persistencia:**
   - Desacople en `authInterceptor` mediante lectura directa de tokens en cabeceras e inyección lazy con `Injector.get(AuthService)` únicamente en caso de 401.
   - Ejecución asíncrona diferida con `queueMicrotask` en el constructor de `AuthService`.
   - Limpieza de sesión en `initSession()` restringida a errores de autenticación reales (401/403).

## 3. Criterios de Aceptación (CA)

- **CA-01 (Ocultación a Superadmin):** Cuando un usuario con rol de Superadministrador inicie sesión, el enlace a "Mis Partidos" (`/portal/matches`) no debe aparecer en el sidebar.
- **CA-02 (Ocultación a Administrador de Club):** Cuando un usuario con rol de Director / Administrador de Club (`OWNER` o `ADMIN`) inicie sesión o tenga seleccionado un club que administra, el enlace a "Mis Partidos" no debe aparecer en el sidebar.
- **CA-03 (Visibilidad para Socios e Invitados):** Cuando un socio estándar (`MEMBER`) o invitado (`GUEST`) inicie sesión, el enlace a "Mis Partidos" debe seguir mostrándose y ser completamente accesible.
- **CA-04 (Sidebar con PrimeNG `p-drawer`):** La barra lateral debe estar construida exclusivamente utilizando el componente `p-drawer` (`DrawerModule`) de PrimeNG, sin backdrops ni contenedores `<aside>` manuales.
- **CA-05 (Estilos Homologados en Notificaciones):** La campana y su popover deben utilizar `OverlayBadge` y `Popover` de PrimeNG con tokens de color, bordes y superficies del Design System Stitch, sin clases Tailwind inexistentes.
- **CA-06 (Persistencia de Sesión y Foco en Recarga):** Al recargar cualquier página autenticada (`/admin`, `/admin/pricing`, `/portal/book`), el usuario debe permanecer en la misma ruta sin ser expulsado a `/login` ni generar errores `NG0200`.
- **CA-07 (Cobertura y Tests Unitarios):** Las pruebas unitarias de `spt-app` deben verificar todas las rutas, comportamientos y estados de sesión con éxito al 100%.

