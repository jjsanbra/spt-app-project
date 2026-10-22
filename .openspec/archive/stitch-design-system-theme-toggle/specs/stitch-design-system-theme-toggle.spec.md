# Spec: stitch-design-system-theme-toggle

**Fecha:** 2026-10-22  
**Versión:** 0.1.0  
**Referencia Stitch:** [Sports Club Management Design System (8260991373480520012)](https://stitch.withgoogle.com/projects/8260991373480520012)

---

## Descripción Funcional

Esta especificación detalla la integración del sistema de diseño generado en Google Stitch (*Vibrant Neon Dark & Clean Light*) en el proyecto `spt-app-project`, dotando a la plataforma de:
1. Un tema oscuro inmersivo de alto contraste con acentos neón rosa (`#ff2d78`), cian (`#24ffcd`) y ámbar (`#ffe04a`).
2. Un tema claro limpio con superficies blancas, bordes sutiles y acentos vibrantes.
3. Un mecanismo reactivo para que el usuario pueda alternar libremente entre modo oscuro y modo claro desde cualquier pantalla.
4. Preservación estricta del 100% de los datos, formularios, filtros, columnas y funcionalidades de las vistas actuales de administración, portal y usuarios.

---

## Reglas de Negocio

### RN-THEME-01: Tema Inicial y Fallback
- Si existe una preferencia guardada en el almacenamiento local del navegador (`localStorage.getItem('spt-theme')`), se aplicará dicha preferencia (`dark` o `light`).
- En ausencia de preferencia previa, se detectará la preferencia del sistema operativo del usuario mediante `window.matchMedia('(prefers-color-scheme: dark)')`.
- Si el sistema no especifica preferencia, el tema por defecto será **`dark`** (la identidad visual insignia del Stitch).

### RN-THEME-02: Persistencia Inmediata
- Toda interacción del usuario con el botón selector de tema guardará de forma síncrona el valor resultante en `localStorage.setItem('spt-theme', theme)`.

### RN-THEME-03: Propagación Global al DOM
- El cambio de tema actualizará de manera inmediata el atributo `data-theme` en el elemento raíz `<html>` (`document.documentElement.setAttribute('data-theme', theme)`) y la clase auxiliar `dark-theme` / `light-theme`.
- Todos los estilos de la aplicación definidos con las variables CSS de `_variables.scss` reaccionarán de inmediato sin necesidad de recargar la página.

### RN-THEME-04: Sincronización con Framework PrimeNG
- El preset Aura de PrimeNG estará vinculado al selector `[data-theme="dark"]`, garantizando que overlays, modales, calendarios y dropdowns de PrimeNG adopten las variantes oscuras o claras en perfecta concordancia con los tokens propios de la aplicación.

### RN-DATA-01: Preservación Absoluta de Datos en Vistas
- Las plantillas y componentes de los microfrontends (`spt-admin`, `spt-portal`, `spt-users`) mantendrán intactas todas las variables de contexto, llamadas a servicios, directivas de tabla (`#header`, `#body`, `#emptymessage`), campos de formulario y botones de acción. Ningún dato será omitido, ocultado ni modificado en su semántica funcional.

### RN-DS-01: Prohibición de Valores Hardcodeados
- Ningún archivo `.scss` de componente podrá utilizar valores hexadecimales directos, tamaños en píxeles fijos no estándar o márgenes arbitrarios. Todo estilo visual debe hacer referencia a los tokens semánticos oficiales definidos en `_variables.scss`.

### RN-DS-02: Uso Obligatorio de Mixins Responsivos
- Prohibido el uso de `@media` manuales o breakpoints hardcodeados. Todas las adaptaciones a dispositivos móviles y tablets se implementarán mediante los mixins `@include mobile-xs`, `@include mobile`, `@include tablet`, `@include mobile-or-tablet` y `@include desktop`.

---

## Casos de Uso

### CU-THEME-01: Alternancia de Modo de Color desde el Shell
- **Actor:** Usuario autenticado o anónimo.
- **Precondición:** La aplicación está cargada en el navegador y el Navbar superior es visible.
- **Flujo Principal:**
  1. El usuario visualiza el botón de cambio de tema en la barra superior (icono de sol en modo oscuro, icono de luna en modo claro).
  2. El usuario hace clic en el botón de alternar tema.
  3. `ThemeService.toggleTheme()` invierte el estado actual (`dark` <-> `light`).
  4. El atributo `data-theme` en `<html>` se actualiza inmediatamente.
  5. La interfaz efectúa una transición suave (0.25s) hacia los nuevos tonos y superficies del tema seleccionado.
  6. El nuevo tema queda persistido en `localStorage`.
- **Postcondición:** Todas las vistas, tablas y modales adoptan la paleta del tema seleccionado y el estado persiste entre recargas y navegaciones.

### CU-THEME-02: Detección Automática de Preferencia de Sistema
- **Actor:** Usuario que accede por primera vez a la plataforma.
- **Precondición:** `localStorage` no contiene ninguna clave previa `'spt-theme'`.
- **Flujo Principal:**
  1. La aplicación arranca y `ThemeService` se inicializa.
  2. El servicio consulta `localStorage.getItem('spt-theme')`, obteniendo `null`.
  3. El servicio evalúa la consulta de medios `window.matchMedia('(prefers-color-scheme: dark)')`.
  4. Si la consulta es positiva, se inicializa en `dark`; en caso contrario, se inicializa en `light`.
  5. Se aplica el atributo en el DOM y se renderiza la UI.
- **Postcondición:** La interfaz se adapta automáticamente a las preferencias globales del dispositivo del usuario.

### CU-THEME-03: Navegación por Módulos de Administración con Tema Aplicado
- **Actor:** Administrador del Club o Superadmin.
- **Precondición:** Sesión iniciada y tema activo configurado.
- **Flujo Principal:**
  1. El usuario navega a la sección de Pistas (`/admin/facilities`), Tarifas (`/admin/pricing`) o Miembros (`/admin/members`).
  2. Las tablas de datos (`p-table`) se renderizan con los estilos de cabecera, filas, bordes y badges correspondientes al tema activo.
  3. Toda la información de las entidades (nombres de pista, tipos de pista, iluminación, franjas horarias, precios, estados de socios) se muestra íntegra y legible.
  4. Los botones de acción (`+ Añadir`, editar, eliminar) responden con micro-interacciones acordes a la identidad visual de Stitch.
- **Postcondición:** La gestión administrativa se realiza de forma ergonómica y visualmente atractiva con contraste óptimo en cualquier modo.
