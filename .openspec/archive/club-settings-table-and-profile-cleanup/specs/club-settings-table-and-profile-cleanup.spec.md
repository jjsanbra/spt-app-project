# Spec: club-settings-table-and-profile-cleanup

**Fecha:** 2026-10-28  
**Versión:** 0.1.0  

---

## Descripción Funcional

Este evolutivo desvincula la información de membresías de la pantalla de perfil personal y moderniza la sección de configuración de clubes, ofreciendo una vista consolidada en tabla con edición contextual por modal para administradores y dueños.

---

## Reglas de Negocio

1. **RN-01 (Perfil Personal Enfocado):** La vista `/profile` solo presenta datos de la cuenta e identidad personal del usuario (`User`: nombre, apellidos, teléfono, correo) y su badge global si es SuperAdmin.
2. **RN-02 (Exclusión de Monedero para Roles de Gestión):** Los usuarios con roles `SUPERADMIN`, `OWNER` o `ADMIN` no poseen saldo ni monedero operativo, por lo que no se muestra ningún componente o indicador de monedero para estos roles.
3. **RN-03 (Acceso a Configuración de Clubes):** Solo los usuarios con rol `OWNER`, `ADMIN` en al menos un club, o `SUPERADMIN`, pueden acceder a `/admin/settings`.
4. **RN-04 (Ámbito de Clubes en la Tabla):**
   - Un `SuperAdmin` visualiza todos los centros deportivos registrados en el sistema.
   - Un `OWNER` o `ADMIN` visualiza únicamente los centros deportivos donde posee dicho rol de gestión.
5. **RN-05 (Aislamiento Multi-tenant en Modal):** Al guardar la configuración de un club en el modal, la petición debe enviar la cabecera `x-tenant-id` correspondiente al club seleccionado.
6. **RN-06 (Validación de Horarios):** La hora de apertura debe ser estrictamente menor que la hora de cierre (`openingHour < closingHour`).

---

## Casos de Uso

### CU-01: Visualización y Edición de Perfil Personal

**Actor:** Cualquier usuario autenticado  
**Precondición:** El usuario ha iniciado sesión.  
**Flujo principal:**
1. El usuario navega a `/profile`.
2. El sistema muestra la cabecera con avatar y correo del usuario, junto con el formulario centrado de Datos Personales (nombre, apellidos, teléfono).
3. No se muestra la tarjeta de membresías de clubes.
4. El usuario modifica su nombre o teléfono y pulsa «Guardar».
5. El sistema envía la actualización a `UsersService`, notifica el éxito y actualiza los datos en sesión.

---

### CU-02: Gestión de Configuración de Clubes desde Tabla y Modal

**Actor:** Administrador, Dueño de Club o SuperAdmin  
**Precondición:** El usuario tiene rol `OWNER` o `ADMIN` en uno o varios clubes, o es `SUPERADMIN`.  
**Flujo principal:**
1. El usuario navega a `/admin/settings`.
2. El sistema presenta la cabecera `spt-page-header` y una tabla `p-table` con los clubes gestionables.
3. Cada fila muestra el nombre del club, ciudad, rol del usuario y un botón de acción «Configurar».
4. El usuario pulsa «Configurar» en uno de los clubes.
5. El sistema abre el modal `p-dialog` precargando los horarios, duración de reserva, antelación y modo de pago del club seleccionado.
6. El usuario ajusta los parámetros deseados y pulsa «Guardar».
7. El sistema valida los datos (incluyendo `openingHour < closingHour`), envía la petición `PATCH /api/v1/clubs/settings` con la cabecera `x-tenant-id` del club seleccionado.
8. El sistema muestra notificación de confirmación, cierra el modal y actualiza la información en la tabla.

**Flujo alternativo 6a:** El usuario introduce un horario inválido (`openingHour >= closingHour`).
1. El sistema muestra un mensaje de error y no permite el envío del formulario.
