# Proposal: owner-booking-privileges-and-wallet-visibility

**Fecha:** 2026-10-26  
**Estado:** ✅ Completado
**Archivado:** 2026-10-26  
**Autor:** Antigravity AI  

---

## 1. Contexto y Motivación

En la operativa diaria de los clubes deportivos, tanto el Propietario (`OWNER`) del club como el Administrador Global de la Plataforma (`SUPER_ADMIN`) requieren máxima flexibilidad y autonomía para gestionar y ocupar pistas deportivas sin verse limitados por las reglas de prepago, saldos de monedero o ventanas de antelación mínima (cutoff de 2 horas) que aplican a los socios (`MEMBER`) o invitados (`GUEST`).

Actualmente:
1. En el sidebar global (`app.html`), se muestra a todos los usuarios autenticados la pastilla con su saldo de monedero (`walletBalance`). Para un `OWNER` o `SUPER_ADMIN`, esta información es irrelevante y confusa ya que no operan como clientes que consumen saldo propio en el centro deportivo.
2. En el portal de reservas (`bookings-grid`), se aplica una restricción general de 2 horas de antelación mínima (`isSlotBlockedByCutoff`), impidiendo que un propietario o superadmin reserve una pista disponible de forma inmediata (por ejemplo, para entrar a jugar dentro de 15 minutos o impartir una clínica imprevista).
3. El proceso de tarificación y registro de reservas genera pagos pendientes con el importe estándar de socio/invitado, en lugar de considerar la exención de saldo y coste para estos roles de gestión y supervisión.

## 2. Solución Propuesta

Implementar una política de privilegios exclusivos para los roles privilegiados (`OWNER` en el club activo y `SUPER_ADMIN` global):
1. **Ocultación de Monedero en Sidebar:** Ocultar el componente/badge de saldo de monedero (`.user-wallet-pill`) en el sidebar host cuando el usuario activo sea `SUPER_ADMIN` o posea el rol `OWNER` en el club seleccionado.
2. **Reserva sin Antelación Mínima (Desde la Hora Actual):** Eliminar la restricción de cutoff de 2 horas para `OWNER` y `SUPER_ADMIN`. La **única restricción temporal** es no permitir reservas en fechas/horas pasadas (`startTime >= now`). Pueden reservar cualquier pista libre desde el instante presente en adelante.
3. **Exención de Saldo y Coste Cero:** El propietario y el superadmin no requieren saldo para reservar. La reserva se registra con importe 0,00 € y su correspondiente registro de pago con estado `COMPLETED` (método presencial/cortesía), sin deducción de saldo ni bloqueo por fondos insuficientes.
4. **Claridad en UI del Portal:** El modal de confirmación de reserva muestra explícitamente el estado exento (0,00 €) y un mensaje informativo acorde al rol privilegiado.

## 3. Criterios de Aceptación (CA)

- [ ] **CA-01 (Ocultación de Saldo en Sidebar):** Si el usuario autenticado es `SUPER_ADMIN` o tiene el rol `OWNER` en el club activo, la pastilla de saldo de monedero no se renderiza en el sidebar de navegación. Para roles `ADMIN`, `MEMBER` o `GUEST`, el saldo continúa visualizándose con normalidad.
- [ ] **CA-02 (Reserva Inmediata en Cualquier Momento Futuro):** Un usuario con rol `OWNER` o `SUPER_ADMIN` puede seleccionar y confirmar cualquier franja horaria disponible a partir de la hora actual (`startTime >= now`), omitiendo la restricción de 2 horas de antelación mínima aplicable a otros usuarios.
- [ ] **CA-03 (Bloqueo Estricto de Reservas Pasadas):** Ningún usuario, incluidos `OWNER` y `SUPER_ADMIN`, puede reservar franjas horarias pasadas (`startTime < now`). Tanto el frontend como el backend rechazan peticiones con fecha/hora anterior a la actual emitiendo un error 400 Bad Request.
- [ ] **CA-04 (Exención de Saldo en Backend):** Al crear una reserva, si el usuario es `SUPER_ADMIN` o posee rol `OWNER` en el club activo, la reserva se crea con `totalPrice = 0.00` y el pago asociado se emite con `amount = 0.00` y `status = COMPLETED`, sin validar ni exigir saldo en `walletBalance`.
- [ ] **CA-05 (Feedback en Modal de Reserva):** El modal de confirmación en `bookings-grid` muestra para `OWNER` y `SUPER_ADMIN` el precio total en 0,00 € y un texto informativo descriptivo de exención por rol privilegiado.

## 4. Impacto Estimado

- **Backend:** Modificación en `bookings.service.ts` para verificar `isSuperAdmin` o `ClubRole.OWNER`, validar `start >= new Date()` y asignar coste 0 con pago completado.
- **Frontend:**
  - `spt-app`: Actualización de directiva `@if` en el sidebar (`app.html`) y adición del computed `isOwnerOrSuperAdmin` en `auth.service.ts`.
  - `spt-portal`: Ajuste de `isSlotBlockedByCutoff`, cálculo de precio modal y mensaje informativo en `bookings-grid.component`.
  - Diccionario i18n (`es.json`): Claves de traducción para la exención de gestión/propietario.
- **Base de datos:** Ningún cambio en el esquema Prisma (`schema.prisma`). No se requieren migraciones SQL ni scripts destructivos.
- **Riesgo:** 🟢 Bajo (sin impacto de esquema en BBDD, cambio aditivo con verificación de roles privilegiados).

## 5. Dependencias

- Ninguna (se integra sobre los módulos existentes de `bookings` y `auth`).
