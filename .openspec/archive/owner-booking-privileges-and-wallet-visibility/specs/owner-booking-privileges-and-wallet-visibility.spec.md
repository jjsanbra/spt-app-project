# Spec: owner-booking-privileges-and-wallet-visibility

**Fecha:** 2026-10-26  
**Versión:** 0.1.0  

---

## Descripción Funcional

Esta especificación describe los privilegios exclusivos y ajustes de visualización para los usuarios con rol de Propietario (`OWNER`) o Administrador Global (`SUPER_ADMIN`):
1. Ocultación del indicador de saldo de monedero en la barra lateral de navegación para evitar información redundante o inaplicable a roles de administración/titularidad.
2. Capacidad de reserva inmediata de pistas en cualquier momento futuro (a partir de la hora actual), sin requerir antelación mínima de 2 horas.
3. Restricción estricta de no permitir reservas en franjas horarias pasadas.
4. Exención total de coste y de saldo para el propietario y el superadmin al confirmar una reserva.

---

## Reglas de Negocio

### RN-01: Visibilidad Condicional de Monedero por Rol
- Si el usuario autenticado es `isSuperAdmin` o tiene el rol `OWNER` en el club activo (`activeClub().role === 'OWNER'`), el componente visual del saldo (`.user-wallet-pill`) NO debe renderizarse en el sidebar.
- Si el usuario conmuta a otro club o centro y no es superadmin, teniendo rol `ADMIN`, `MEMBER` o `GUEST`, el componente visual de monedero debe renderizarse con su saldo correspondiente.

### RN-02: Ventana Temporal de Reserva para Roles Privilegiados
- Los roles `OWNER` y `SUPER_ADMIN` pueden reservar franjas horarias libres desde la hora actual en adelante (`startTime >= now`).
- Los roles `OWNER` y `SUPER_ADMIN` están exentos del tiempo de antelación mínima (cutoff de 2 horas) que aplica a socios e invitados.
- **Única restricción temporal:** Ni el `OWNER` ni el `SUPER_ADMIN` pueden reservar en el pasado (`startTime < now`). Intentar reservar un slot cuyo inicio sea anterior a la hora actual debe resultar en bloqueo en el grid y error 400 en el backend.

### RN-03: Exención de Saldo y Coste Cero para Roles Privilegiados
- Toda reserva creada por un usuario `SUPER_ADMIN` o con rol `OWNER` en su club se genera con `totalPrice = 0.00`.
- El usuario NO requiere disponer de saldo en su monedero (`walletBalance`) para completar la reserva.
- El registro de pago asociado se genera automáticamente con `amount = 0.00` y estado `COMPLETED` (método presencial/cortesía), sin generar débitos ni transacciones de cobro diferido.

---

## Casos de Uso

### CU-01: Navegación de un Usuario SUPER_ADMIN u OWNER en el Shell
**Actor:** Propietario (`OWNER`) o Super Administrador (`SUPER_ADMIN`)  
**Precondición:** El usuario ha iniciado sesión y es `isSuperAdmin` o su club activo tiene asignado el rol `OWNER`.  
**Flujo principal:**
1. El usuario accede a cualquier pantalla de la aplicación.
2. En la parte inferior del sidebar, el sistema renderiza el avatar con sus iniciales y su nombre completo.
3. El sistema evalúa si el usuario es `SUPER_ADMIN` o `OWNER`. Al detectarlo, omite el renderizado del badge de monedero (`.user-wallet-pill`).
**Postcondición:** La barra lateral muestra el perfil limpio sin el indicador de monedero.

### CU-02: Reserva Inmediata de Pista por Roles Privilegiados
**Actor:** Propietario (`OWNER`) o Super Administrador (`SUPER_ADMIN`)  
**Precondición:** El usuario se encuentra en el portal de reservas (`/portal/bookings`) de su club. Existe una pista libre 10 minutos después de la hora actual.  
**Flujo principal:**
1. El usuario visualiza la parrilla de disponibilidad del día actual.
2. El sistema comprueba la franja: dado que `startTime >= now`, el slot aparece en estado disponible (verde) y clickeable para el rol privilegiado (a diferencia de un socio, para quien estaría bloqueado por la regla de 2 horas de antelación).
3. El usuario hace click en el slot.
4. Se abre el modal de confirmación mostrando:
   - Instalación y horario seleccionados.
   - Precio total: `0,00 €` con etiqueta `Exento`.
   - Mensaje informativo de exención.
5. El usuario pulsa "Confirmar reserva".
6. El backend valida que la franja no está en el pasado, crea la reserva con precio 0,00 € y genera el pago completado.
**Postcondición:** La reserva queda confirmada en el sistema y la pista pasa a estado ocupada.

### CU-03: Intento de Reserva en Fecha u Hora Pasada por Rol Privilegiado
**Actor:** Propietario (`OWNER`) o Super Administrador (`SUPER_ADMIN`)  
**Precondición:** El usuario visualiza la parrilla del día actual.  
**Flujo principal:**
1. El usuario observa franjas horarias cuyo inicio ya ha transcurrido (`startTime < now`).
2. El sistema marca el slot como bloqueado en la cuadrícula.
3. Si el usuario intenta forzar la acción o interactuar con el slot pasado, el sistema no abre el modal o emite un aviso de franja no disponible.
4. Si se emitiera una petición HTTP al backend con fecha/hora pasada, el backend responde con código de estado HTTP 400 y mensaje `No se puede reservar en fechas pasadas`.
**Postcondición:** No se crea ninguna reserva en el pasado.
