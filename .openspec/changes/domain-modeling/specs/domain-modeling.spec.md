# Spec: domain-modeling (Fase 1)

**Fecha:** 2026-10-20  
**Versión:** 0.1.0  

---

## Descripción Funcional

Esta especificación establece el modelo de datos relacional y las entidades fundamentales para la plataforma SaaS multi-tenant SPT App, cubriendo la gestión de clubes (tenants), usuarios, membresías, instalaciones multi-deporte, bloqueos, tarifas, reservas completas y partidas abiertas, cobros locales/presenciales y notificaciones.

---

## Reglas de Negocio

1. **RN-01 (Multi-tenancy obligatorio):** Toda entidad que pertenezca a un centro deportivo (`Facility`, `FacilityBlock`, `PricingRule`, `Booking`, `Payment`) debe estar vinculada obligatoriamente a un `club_id` indexado.
2. **RN-02 (Unicidad de Usuario Global):** Los usuarios tienen una cuenta global (`email` único) y pueden pertenecer a múltiples clubes mediante `ClubMembership` con roles diferenciados (`OWNER`, `ADMIN`, `STAFF`, `MEMBER`, `GUEST`).
3. **RN-03 (Capacidad por Instalación):** Cada pista (`Facility`) define `sportType`, `minPlayers` y `maxPlayers`, permitiendo que el motor de reservas gestione deportes desde 2 hasta 22 jugadores.
4. **RN-04 (Concurrencia de Reservas):** No pueden existir dos reservas activas (`status != 'CANCELLED'`) que solapen el mismo rango de tiempo (`startTime`, `endTime`) en la misma instalación (`facilityId`).
5. **RN-05 (Desglose de Partidas Abiertas):** En reservas de tipo `OPEN`, cada participante (`BookingParticipant`) ocupa una plaza (`slotNumber`) y asume un `individualPrice` proporcional (`totalPrice / numPlayers`).
6. **RN-06 (Pago en Centro Local):** Cuando una reserva se abona en mostrador, el registro `Payment` pasa a `COMPLETED`, registrando obligatoriamente el empleado que cobró (`processedByUserId`) y la fecha (`processedAt`).

---

## Casos de Uso

### CU-01: Creación de Reserva Completa con Pago en Centro

**Actor:** Usuario Jugador / Empleado de Club  
**Precondición:** La pista está disponible en el horario seleccionado (sin bloqueos ni reservas previas).  
**Flujo principal:**
1. El usuario selecciona club, pista, fecha y franja horaria.
2. El sistema valida la no colisión con otras reservas y bloqueos de mantenimiento.
3. Se calcula el precio total aplicando las reglas de `PricingRule` (considerando si es socio o invitado y recargo de luz).
4. Se crea el registro `Booking` en estado `CONFIRMED` con `bookingType = FULL`.
5. Se genera un registro `Payment` en estado `PENDING` con método `PRESENTIAL_CASH` o `PRESENTIAL_POS`.
6. Al llegar a las instalaciones, el empleado de recepción cobra y marca el `Payment` como `COMPLETED`, asociando su `userId`.  
**Postcondición:** La pista queda ocupada en el cuadrante y el cobro queda registrado y auditado.

### CU-02: Publicación y Unión a Partida Abierta

**Actor:** Usuario Creador (Host) y Otros Jugadores  
**Precondición:** El club permite partidas abiertas en esa instalación deportiva.  
**Flujo principal:**
1. El anfitrión crea una reserva `OPEN` seleccionando pista y franja horaria.
2. Se genera `Booking` con `bookingType = OPEN` y se añade al anfitrión como `BookingParticipant` con `isHost = true` y `slotNumber = 1`.
3. Otros jugadores consultan las partidas abiertas en el portal y se unen ocupando las plazas vacantes (`slotNumber = 2, 3, 4...`).
4. Si se alcanza `minPlayers` antes del tiempo límite (`openGameMinNoticeHours`), la partida se confirma formalmente.  
**Postcondición:** Todos los jugadores tienen su plaza asignada y su importe individual registrado para abonar en recepción o saldo de monedero.
