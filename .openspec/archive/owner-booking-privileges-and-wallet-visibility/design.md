# Design: owner-booking-privileges-and-wallet-visibility

**Fecha:** 2026-10-26  
**Estado:** 🟡 Borrador  

---

## 1. Diagrama / Arquitectura

```mermaid
flowchart TD
    A[Usuario selecciona Franja Horaria en Grid] --> B{¿Es la fecha/hora anterior a ahora?}
    B -- Sí (startTime < now) --> C[Bloqueado: Reserva en Pasado No Permitida]
    B -- No (startTime >= now) --> D{¿Usuario es SUPER_ADMIN o OWNER?}

    D -- Sí (Privilegiado) --> E[Omitir Cutoff de 2 Horas: Franja Disponible]
    D -- No (MEMBER / GUEST / ADMIN) --> F{¿startTime >= now + 2h?}
    F -- No --> G[Bloqueado por Antelación Mínima de 2 horas]
    F -- Sí --> H[Franja Disponible para Reserva]

    E --> I[Abrir Modal de Confirmación]
    H --> I

    I --> J{¿Usuario es SUPER_ADMIN o OWNER?}
    J -- Sí --> K[Precio 0,00 € + Mensaje Exención]
    J -- No --> L[Precio según Tarifa y Suplemento Luz]

    K --> M[Confirmar Reserva -> POST /api/v1/bookings]
    L --> M

    M --> N[Backend: Validar start >= now y solapamiento]
    N --> O{¿user.isSuperAdmin || membership.role == OWNER?}
    O -- Sí --> P[totalPrice = 0.00, PaymentStatus = COMPLETED]
    O -- No --> Q[totalPrice = Regla Tarifa, PaymentStatus = PENDING]
    P --> R[Reserva Confirmada Exenta]
    Q --> S[Reserva Confirmada Estándar]
```

## 2. Contratos de API (OpenAPI)

El endpoint `POST /api/v1/bookings` mantiene su contrato DTO actual (`CreateBookingDto`), sin requerir nuevos campos en el payload del cliente:

```yaml
/api/v1/bookings:
  post:
    summary: Crear nueva reserva completa o abierta
    tags:
      - Bookings
    security:
      - bearerAuth: []
    parameters:
      - name: x-club-id
        in: header
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateBookingDto'
    responses:
      '201':
        description: Reserva creada exitosamente (totalPrice: 0 si es SUPER_ADMIN u OWNER)
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BookingResponseDto'
      '400':
        description: Fechas inválidas o intento de reserva en el pasado
      '404':
        description: Instalación no encontrada
      '409':
        description: Conflicto por solapamiento con bloqueo o reserva previa
```

## 3. Modelos de Datos Afectados

No se altera el esquema de Prisma (`schema.prisma`). Los modelos existentes ya satisfacen los requerimientos:
- `User`: Contiene el flag booleano `isSuperAdmin`.
- `ClubRole`: Contiene `OWNER`, `ADMIN`, `MEMBER`, `GUEST`.
- `Booking`: `totalPrice Decimal` permite `0.00`.
- `Payment`: `amount Decimal` permite `0.00` y `status PaymentStatus` soporta `COMPLETED`.
- `ClubMembership`: Mantiene el saldo de monedero `walletBalance`, el cual no es modificado ni descontado para roles privilegiados.

## 4. Evaluación de Riesgo en Base de Datos

| Análisis de Riesgo | Evaluación | Mitigación |
|--------------------|------------|------------|
| **Modificación de Tablas / Columnas** | Ninguna (0 tablas alteradas) | No se requiere migración SQL. El schema de producción permanece intacto. |
| **Aislamiento Multi-Tenant (`club_id`)** | Estricto | Todas las consultas y validaciones de membresía filtran por `clubId` del header y `userId` del JWT. |
| **Integridad Transaccional** | Alta | La creación de reserva y pago se mantiene dentro del bloque `$transaction(async (tx) => ...)`. |
| **Pérdida de Datos** | Nula | No se borran ni modifican datos existentes de monederos o socios. |

## 5. Diseño UI

### 5.1. Sidebar del Shell (`apps/frontend/projects/spt-app/src/app/app.html`)
- **Regla Visual:** La pastilla `.user-wallet-pill` solo se renderiza si `authService.activeClub()` existe **Y** `authService.isOwnerOrSuperAdmin()` es `false`.
- **Efecto:** Ni el Propietario ni el Super Admin visualizan el bloque de saldo de monedero.

### 5.2. Selector de Franja y Modal de Reserva (`spt-portal`)
- **Lógica de Bloqueo (`isSlotBlockedByCutoff`):**
  - Si `isOwnerOrSuperAdmin`: retorna `true` solo si `slotDateTime < now` (pasado). No aplica el cutoff de 2 horas.
  - Si no es privilegiado: retorna `true` si `slotDateTime < now + 2 horas`.
- **Modal de Confirmación:**
  - Si `isOwnerOrSuperAdmin`: el desglose de precio muestra `0,00 €` y una etiqueta semántica `PORTAL.BOOKINGS.PRIVILEGED_EXEMPT_LABEL`.
  - El mensaje de pago presencial es sustituido por `PORTAL.BOOKINGS.PRIVILEGED_PAYMENT_NOTICE` informando de la exención de pago.

## 6. Decisiones Técnicas

1. **Determinación del Privilegio en Backend:**
   - Se consulta en la transacción tanto el flag `user.isSuperAdmin` como la membresía `membership.role === ClubRole.OWNER`. Si cualquiera es verdadero, se activa la exención de coste y pago completado.
2. **Cálculo de Precios para Roles Privilegiados:**
   - Se fija `totalPrice = 0` y `amount = 0` con `PaymentStatus.COMPLETED`. Esto evita que queden pagos pendientes de cobro en los balances del centro.
3. **Restricción de Pasado:**
   - Se añade explícitamente en el backend `if (start < new Date()) throw new BadRequestException(...)` para proteger contra llamadas directas a la API que intenten reservar fechas u horas pasadas.
