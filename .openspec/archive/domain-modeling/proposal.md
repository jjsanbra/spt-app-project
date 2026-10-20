# Proposal: domain-modeling (Fase 1)

**Fecha:** 2026-10-20  
**Estado:** ✅ Completado
**Archivado:** 2026-10-20  
**Autor:** Antigravity Architect  

---

## 1. Contexto y Motivación

SPT App es un SaaS deportivo multi-tenant diseñado para gestionar centros con múltiples pistas e instalaciones (pádel, tenis, fútbol, etc.), control de concurrencia y dos modalidades principales de reserva: **Reserva Completa** y **Partidas Abiertas** (por plazas individuales).

Para garantizar la escalabilidad, la separación estricta de datos entre clubes (Row-Level Security por `club_id`) y soportar el flujo de **cobro en el centro local (pago diferido en recepción)** con capacidad futura de pasarelas online (Stripe/Redsys) mediante el patrón Adapter, es imprescindible definir un modelo de datos robusto, normalizado y con índices optimizados para consultas de alta concurrencia en cuadrantes y calendarios de reservas.

---

## 2. Solución Propuesta

Se propone un esquema relacional integral en **PostgreSQL con Prisma ORM (v5)** estructurado en 10 entidades esenciales:

1. **`Club` (Tenant):** Centro deportivo con configuración de horarios de apertura/cierre, duración de slots, reglas de aviso para partidas abiertas y política de cobro (`PRESENTIAL`, `ONLINE`, `HYBRID`).
2. **`User` (Usuario Global):** Usuario con cuenta única en la plataforma, capaz de interactuar con múltiples clubes sin duplicar credenciales. Incluye flag de `isSuperAdmin`.
3. **`ClubMembership` (Membresía Multi-tenant):** Vinculación de un usuario a un club específico con su rol (`OWNER`, `ADMIN`, `STAFF`, `MEMBER`, `GUEST`), número de socio y saldo en monedero virtual.
4. **`Facility` (Pistas / Canchas):** Espacios deportivos multi-deporte (`PADEL`, `TENNIS`, `FOOTBALL_7`, `FOOTBALL_11`, etc.), tipos (`INDOOR`, `OUTDOOR`, `COVERED`), superficies y rango configurable de jugadores mínimos y máximos.
5. **`FacilityBlock` (Bloqueos de Pistas):** Indisponibilidad por mantenimiento, escuela, torneos o eventos especiales sin saturar la tabla de reservas.
6. **`PricingRule` (Motor de Tarifas):** Precios flexibles por franja (hora punta/valle), día de la semana, condición de socio (`memberPrice` vs `guestPrice`) y suplementos de iluminación.
7. **`Booking` (Motor de Reservas):** Registro maestro de reservas (`FULL` u `OPEN`), con estados (`PENDING_CONFIRMATION`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`), control de fechas y cálculo de importes.
8. **`BookingParticipant` (Plazas / Jugadores):** Detalle de jugadores en partidas abiertas y reservas completas, soportando tanto usuarios registrados como invitados locales con desglose de precio individual.
9. **`Payment` (Cobros y Pagos):** Registro de transacciones desacoplado mediante patrón Adapter. En Fase 1 soporta pagos presenciales (`PRESENTIAL_CASH`, `PRESENTIAL_POS`, `WALLET`) registrando qué empleado cobró en mostrador, y preparado para Stripe/Redsys en el futuro.
10. **`Notification` (Alertas):** Centro de avisos para usuarios ante confirmaciones, cancelaciones o quórum de partidas abiertas.

### Decisiones Arquitectónicas Clave:
- **Franjas horarias dinámicas:** Se calcula la disponibilidad al vuelo a partir del horario del club + bloqueos + reservas existentes (evitando millones de filas pregeneradas en BD).
- **Aislamiento Multi-tenant estricto:** Todas las entidades pertenecientes a un club cuentan con clave foránea `club_id` indexada.
- **Header `x-tenant-id`:** Las peticiones autenticadas indican el club sobre el que operan, validándose contra `ClubMembership`.

---

## 3. Criterios de Aceptación

- [ ] **CA-01 (Multi-tenancy):** Todas las entidades específicas del centro (`Facility`, `FacilityBlock`, `PricingRule`, `Booking`, `Payment`) poseen `club_id` como clave foránea obligatoria e índice compuesto.
- [ ] **CA-02 (Multi-deporte y capacidad):** Cada `Facility` define `sportType`, `minPlayers` y `maxPlayers` para soportar desde deportes de 2 jugadores (tenis) hasta 22 (fútbol 11).
- [ ] **CA-03 (Partidas Abiertas):** Soporte de reservas `OPEN` con participantes vinculados (`BookingParticipant`) con precio individual prorrateado.
- [ ] **CA-04 (Pago Presencial / Local):** La entidad `Payment` permite estados `PENDING` y `COMPLETED` con métodos locales (`PRESENTIAL_CASH`, `PRESENTIAL_POS`), asociando al empleado (`processedByUserId`) que valida el cobro en mostrador.
- [ ] **CA-05 (Integridad y Migraciones):** El esquema compila en Prisma (`prisma validate`, `prisma format`, `prisma generate`) y genera una migración limpia en PostgreSQL sin errores.
- [ ] **CA-06 (Seed de Datos inicial):** Se incluye un script de seed (`prisma/seed.ts`) con 1 club de demostración, 1 superadmin, 1 admin de club, 4 pistas (pádel indoor, pádel cristal, tenis tierra batida, fútbol 7) y tarifas base.

---

## 4. Impacto Estimado

- **Backend:** Actualización completa de `apps/backend/prisma/schema.prisma` y creación de `prisma/seed.ts`.
- **Frontend:** Ningún cambio inmediato de código UI en esta fase, pero el esquema servirá de base para la generación de contratos y DTOs en las fases posteriores.
- **Base de datos:** Creación de tablas e índices en PostgreSQL. Riesgo cero en datos al estar en entorno inicial de desarrollo.
- **Riesgo:** 🟢 Bajo (entorno de desarrollo inicial, esquema limpio).

---

## 5. Dependencias

- **Fase 0 (Scaffolding):** Completada y consolidada en commit `ee1f678`.
- Contenedor de PostgreSQL 16 accesible para aplicar la migración inicial.
