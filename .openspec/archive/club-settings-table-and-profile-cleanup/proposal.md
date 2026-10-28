# Proposal: club-settings-table-and-profile-cleanup

**Fecha:** 2026-10-28  
**Estado:** ✅ Completado
**Archivado:** 2026-10-28  
**Autor:** Antigravity & User  

---

## 1. Contexto y Motivación

Actualmente, existen dos fricciones importantes en la experiencia de usuario y arquitectura de vistas:

1. **Redundancia en la vista de perfil (`spt-users` / `/profile`):**
   - La pantalla de perfil muestra dos columnas: datos personales a la izquierda y «Mis Clubes y Membresías» a la derecha con botones de «Cambiar de club».
   - Con la reciente incorporación del selector global en el Topbar con buscador modal y cambio en un clic, el listado y los botones de «Cambiar de club» en el perfil son redundantes y sobrecargan la pantalla.
   - Además, para usuarios con roles de gestión (`SUPERADMIN`, `OWNER`, `ADMIN`), la presencia de saldos de monedero es conceptualmente incorrecta: ni los superadministradores ni los administradores/dueños de club disponen ni hacen uso de monederos, los cuales son exclusivos de los socios jugadores (`PLAYER`).

2. **Rigidez en la configuración de clubes (`spt-admin` / `/admin/settings`):**
   - La vista de configuración asume un único contexto activo y abre directamente el formulario del club seleccionado en el Topbar.
   - Si un usuario es dueño o administrador de múltiples centros deportivos (o SuperAdmin), debe cambiar de club previamente en el Topbar para poder configurar cada uno.
   - Resulta mucho más potente y natural presentar primero un listado tabular (`p-table`) con los clubes que el usuario gestiona, y desde una acción por fila («Configurar») abrir un diálogo modal (`p-dialog`) con la configuración operativa y horarios del centro seleccionado.

---

## 2. Solución Propuesta

1. **Refactorización de «Mi Perfil» (`/profile`):**
   - Eliminar la tarjeta de «Mis Clubes y Membresías».
   - Reestructurar el formulario de «Datos Personales» en un diseño limpio y centrado, enfocado exclusivamente en la identidad del usuario y credenciales.
   - Confirmar que los monederos quedan ocultos para roles de gestión (`SUPERADMIN`, `OWNER`, `ADMIN`).

2. **Evolutivo de «Configuración de Clubes» (`/admin/settings`):**
   - Transformar la página en un panel con cabecera `spt-page-header` y tabla `p-table` de **Clubes Administrados**.
   - La tabla listará los clubes sobre los que el usuario tiene permisos (`OWNER`, `ADMIN` o todos si es `SUPERADMIN`).
   - Columnas: Nombre del Club, Ciudad/Ubicación, Rol del usuario, Indicador de Club Activo en sesión, y columna de Acciones.
   - Acción «Configurar» por fila: Abre un diálogo modal (`p-dialog`) con el formulario completo de configuración del club (nombre, email, teléfono, dirección, horario apertura/cierre, duración de pista, antelación de partidos abiertos y modo de pago).
   - Al guardar en el modal, la petición de actualización se envía al backend con el `x-tenant-id` correspondiente al club editado. Si se edita el club activo, se sincroniza el estado de la aplicación.

---

## 3. Criterios de Aceptación

- [ ] **CA-01 (Perfil Limpio):** La vista `/profile` debe mostrar únicamente la cabecera de perfil de usuario y el formulario de «Datos Personales» centrado y estilizado, habiéndose eliminado la tarjeta de clubes y membresías.
- [ ] **CA-02 (Exclusión de Monederos):** Ni los superadmins ni los admin/owner deben visualizar bloques ni etiquetas de monedero en las vistas de gestión ni perfil.
- [ ] **CA-03 (Tabla de Configuración de Clubes):** La ruta `/admin/settings` debe mostrar una tabla `p-table` con los clubes gestionables por el usuario autenticado (`OWNER`/`ADMIN` o todos si es `SUPERADMIN`), mostrando sus datos básicos y rol.
- [ ] **CA-04 (Modal de Configuración por Club):** Al pulsar la acción «Configurar» en una fila de la tabla, se debe abrir un modal `p-dialog` precargado con la configuración del club seleccionado.
- [ ] **CA-05 (Guardado Seguro Multi-tenant):** El guardado del formulario en el modal debe enviar la petición a la API asociando explícitamente el `x-tenant-id` del club seleccionado, mostrando notificación de éxito y refrescando la tabla sin requerir cambio previo de inquilino en sesión.
- [ ] **CA-06 (Calidad y Tests):** Todas las suites de pruebas unitarias (`spt-users`, `spt-admin`, `spt-app`) deben actualizarse y pasar al 100%.

---

## 4. Impacto Estimado

- **Backend:** Sin cambios requeridos. Los controladores `ClubsController` (`/clubs/settings`) y `TenantGuard` ya soportan actualización por `x-tenant-id` para usuarios con membresía `OWNER`/`ADMIN` y `SUPERADMIN`.
- **Frontend:**
  - `spt-users`: Simplificación de `profile.component.html/scss/ts/spec.ts`.
  - `spt-admin`: Reescritura de `club-settings.component.html/scss/ts/spec.ts` para integrar tabla y modal PrimeNG.
  - `i18n`: Nuevas claves de internacionalización en `es.json`.
- **Base de datos:** Ninguno (no se modifica el esquema de Prisma).
- **Riesgo:** 🟢 Bajo (mejora de UX y visualización sin riesgo en base de datos).

---

## 5. Dependencias

- Ninguna. Se construye sobre los componentes y servicios existentes de `@core`.
