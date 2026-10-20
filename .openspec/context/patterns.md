# Patrones de Arquitectura y Desarrollo (SPT Monorepo)

## 1. Patrón Single Source of Truth (Spec-Driven Development)
* **Fuente de Verdad del Modelo y API:** Controladores y DTOs de NestJS decorados con `@nestjs/swagger` y `class-validator`.
* **Exportación del Contrato:** `apps/backend/openapi.json` mediante el script `npm run swagger:export`.
* **Consumo Frontend:** Generación tipada estricta con **Orval** en la librería compartida `@core` (`libs/core` o `projects/spt-app/src/app/core`).

---

## 2. Patrón de Consumo en Microfrontends (@core) y Modelos Orval
* Todos los microfrontends (`spt-app`, `spt-admin`, `spt-portal`, `spt-users`) consumen modelos, DTOs y clientes de red importando exclusivamente desde `@core`.
* **Prohibición Estricta de Interfaces Duplicadas:** No declarar interfaces paralelas en componentes para datos de la API (ej: `FacilityDto`, `CreateBookingPayload`, `PricingRuleModel`). Se consumen los tipos oficiales de Orval (`CreateBookingRequest`, `FacilityResponse`, `BookingDetails`, etc.).
* **Composición para Eventos de UI:** Si un componente, formulario o modal necesita asociar identificadores o propiedades locales de UI, se extiende el DTO generado en lugar de redeclararlo:
  ```typescript
  import { CreateBookingRequest } from '@core';

  export interface BookingModalPayload extends CreateBookingRequest {
    facilityName: string;
    courtTypeLabel: string;
  }
  ```

---

## 3. Patrón de Autenticación y Multi-Tenancy (Tenant Resolution)
* **Interceptor HTTP Global (`auth.interceptor.ts`):**
  - Inyecta la cabecera `Authorization: Bearer <jwt-token>`.
  - Inyecta la cabecera `x-tenant-id: <active-club-id>` obtenida del estado reactivo del usuario en el shell.
* **Resolución y Protección en NestJS:**
  - `JwtAuthGuard`: Valida la firma del token y extrae el `userId`.
  - `TenantGuard`: Extrae `x-tenant-id`, valida que el club exista y que el usuario tenga una membresía activa (`ClubMembership`) con el rol necesario (`OWNER`, `ADMIN`, `STAFF`, `MEMBER`).
  - `@CurrentTenant()` y `@CurrentUser()` decoradores personalizados para inyectar el contexto en los controladores.

---

## 4. Patrón Adapter para Pagos y Cobros
* Para evitar acoplar el motor de reservas a una pasarela concreta, el servicio de pagos utiliza una interfaz abstracta `PaymentGatewayAdapter`:
  ```typescript
  export interface PaymentGatewayAdapter {
    processPayment(payload: ProcessPaymentDto): Promise<PaymentResult>;
    refundPayment(paymentId: string): Promise<RefundResult>;
  }
  ```
* En la Fase 1, se implementa `PresentialPaymentAdapter`:
  - Registra pagos en efectivo (`PRESENTIAL_CASH`) o TPV del club (`PRESENTIAL_POS`).
  - Almacena el identificador del empleado responsable (`processedByUserId`) y fecha (`processedAt`).
* En fases posteriores, añadir `StripePaymentAdapter` o `RedsysPaymentAdapter` solo requerirá implementar esta interfaz sin modificar la tabla `Booking` ni las entidades maestras.

---

## 5. Patrón de Cálculo Dinámico de Disponibilidad (Sin TimeSlots Físicos)
* **Evitar saturación de BD:** En lugar de persistir millones de filas para cada franja de cada día, el servicio `AvailabilityService` calcula los slots libres al vuelo:
  1. Extrae el horario de apertura y cierre del club para la fecha solicitada.
  2. Genera los intervalos según la duración configurada en la pista (`Facility.defaultSlotMinutes`).
  3. Ejecuta una sola consulta indexada contra `Booking` y `FacilityBlock`.
  4. Mapea cada slot como `AVAILABLE`, `OCCUPIED`, `BLOCKED`, o `OPEN_GAME_AVAILABLE`.
