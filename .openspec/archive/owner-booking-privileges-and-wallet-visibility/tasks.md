# Tasks: owner-booking-privileges-and-wallet-visibility

**Fecha:** 2026-10-26  
**Estado:** 🟢 Completado  

---

## Fase 1: Backend — Privilegios de Reserva y Validación Temporal

- [x] **T1.1 (Validación de fecha pasada):** Añadir validación en `BookingsService.create` para impedir reservas en el pasado (`start < new Date()`), emitiendo `BadRequestException('No se puede reservar en fechas pasadas')`.
- [x] **T1.2 (Detección de rol SUPER_ADMIN / OWNER y exención):** En `BookingsService.create`, verificar si el usuario es `user.isSuperAdmin` o si la membresía activa es `ClubRole.OWNER`. Si es así, fijar `totalPrice = 0` y emitir el registro de pago con `amount = 0` y `status = PaymentStatus.COMPLETED`.
- [x] **T1.3 (Tests unitarios Backend):** Añadir y actualizar tests en `bookings.service.spec.ts` cubriendo:
  - Reserva de usuario `OWNER` con precio 0 y pago completado.
  - Reserva de usuario `SUPER_ADMIN` con precio 0 y pago completado.
  - Rechazo de reserva en fecha/hora pasada para cualquier rol.
  - Reserva estándar de `MEMBER` manteniendo tarificación normal.

---

## Fase 2: Frontend Shell — Visibilidad de Monedero en Sidebar

- [x] **T2.1 (Signal helper en AuthService):** Añadir `readonly isOwnerOrSuperAdmin = computed(() => this.isSuperAdmin() || this.activeClub()?.role === 'OWNER');` en `apps/frontend/projects/spt-app/src/app/core/services/auth.service.ts`.
- [x] **T2.2 (Ocultar pastilla en Sidebar):** En `apps/frontend/projects/spt-app/src/app/app.html`, condicionar el bloque `.user-wallet-pill` para que no se muestre si `authService.isOwnerOrSuperAdmin()` es verdadero.
- [x] **T2.3 (Tests unitarios Shell):** Actualizar `app.spec.ts` verificando que la pastilla de monedero no se renderiza si el usuario es `SUPER_ADMIN` o `OWNER`, y sí se muestra para roles `MEMBER` o `ADMIN`.

---

## Fase 3: Frontend Portal — Desbloqueo de Franjas y Modal para Roles Privilegiados

- [x] **T3.1 (Internacionalización i18n):** Declarar las claves de traducción en `apps/frontend/projects/spt-app/src/assets/i18n/es.json` bajo `PORTAL.BOOKINGS` (`PRIVILEGED_EXEMPT_LABEL`, `PRIVILEGED_PAYMENT_NOTICE`, `ERR_PAST_DATE`, `SLOT_PAST_TOOLTIP`).
- [x] **T3.2 (Lógica de Cutoff en BookingsGridComponent):** Inyectar `AuthService` en `BookingsGridComponent` y actualizar `isSlotBlockedByCutoff`:
  - Si el usuario es `SUPER_ADMIN` u `OWNER`, bloquear únicamente si la franja es anterior al instante presente (`slotDateTime.getTime() < Date.now()`), permitiendo reservar de la hora actual en adelante sin restricción de antelación.
  - Si es otro rol, mantener el cutoff de 2 horas.
- [x] **T3.3 (UI de Modal de Confirmación):** En `bookings-grid.component.html` y `calculateTotalModalPrice()`, mostrar coste 0,00 € con distintivo de exención y aviso de exención cuando el usuario sea `SUPER_ADMIN` u `OWNER`.
- [x] **T3.4 (Tests unitarios Portal):** Añadir tests en `bookings-grid.component.spec.ts` verificando:
  - `isSlotBlockedByCutoff` para `OWNER` y `SUPER_ADMIN` permite slots dentro de las próximas 2 horas si no han pasado.
  - `isSlotBlockedByCutoff` bloquea slots pasados para `OWNER` y `SUPER_ADMIN`.
  - El modal muestra 0,00 € cuando el usuario activo es `OWNER` o `SUPER_ADMIN`.

---

## Fase 4: Validación Integral y Verificación OpenSpec

- [x] **T4.1 (Ejecución de Tests Backend):** Ejecutar `npm run test:backend` y verificar paso de suites (30/30 suites pasadas, 184/184 tests OK).
- [x] **T4.2 (Ejecución de Tests Frontend):** Ejecutar tests en `spt-app` (44/44 tests OK) y `spt-portal` (53/53 tests OK).
- [x] **T4.3 (Build Global):** Ejecutar `npm run build:all` y `npm run build:backend` (ambos exitosos con 0 errores).
- [x] **T4.4 (Chequeo OpenSpec):** Ejecutar `npm run spec:check` (catálogo y cambio activo íntegros y válidos).
