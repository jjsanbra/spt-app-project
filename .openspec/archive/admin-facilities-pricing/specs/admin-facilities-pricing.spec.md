# Especificación Funcional: admin-facilities-pricing (Fase 3)

**Versión:** 1.0.0  
**Fecha:** 2026-10-20  
**Módulos Afectados:** Backend (`facilities`, `pricing`), Frontend (`spt-admin`, `@core`)  

---

## 1. Reglas de Negocio — Instalaciones Deportivas (`Facility`)

1. **Aislamiento por Club:** Toda instalación creada o consultada debe estar vinculada de forma obligatoria e inmutable al `club_id` activo del administrador.
2. **Deportes Soportados:** `SportType` (`PADEL`, `TENNIS`, `FOOTBALL_7`, `FOOTBALL_11`, `BASKETBALL`, `MULTI_SPORT`).
3. **Tipología de Pista:**
   - `courtType`: `INDOOR`, `OUTDOOR`, `COVERED`.
   - `surfaceType`: `CRYSTAL`, `CLAY`, `SYNTHETIC_GRASS`, `CONCRETE`, `PARQUET`, `RESIN`.
4. **Capacidades y Franjas:**
   - `defaultSlotMinutes`: Franja estándar de reserva en minutos (habitualmente 60 o 90 min).
   - `minPlayers` y `maxPlayers`: Por ejemplo, para pádel `min=4, max=4`; para tenis `min=2, max=4`.
5. **Borrado Lógico:** La eliminación de una pista no destruye reservas históricas en base de datos; conmuta la bandera `isActive = false`.

---

## 2. Reglas de Negocio — Bloqueos de Pista (`FacilityBlock`)

1. **Rango de Tiempo Obligatorio:** Todo bloqueo requiere una fecha/hora de inicio (`startTime`) y de fin (`endTime`), validando estrictamente que `startTime < endTime`.
2. **Motivo del Bloqueo:** Debe registrar un `title` breve (ej: *"Mantenimiento focos"*, *"Torneo Primavera Pádel"*) y opcionalmente un campo `reason` detallado.
3. **Efecto en Disponibilidad:** Durante el rango `[startTime, endTime]`, el motor de reservas de la Fase 4 considerará la instalación no disponible para usuarios o socios.

---

## 3. Reglas de Negocio — Reglas de Precios y Tarifas (`PricingRule`)

1. **Prioridad y Coincidencia:** Cada regla tiene una prioridad (`priority`). Si coinciden varias reglas aplicables para una franja, prevalece la de mayor prioridad o especificidad de pista.
2. **Discriminación Socio vs Invitado:** Todo cálculo de precio devuelve dos tarifas independientes: `memberPrice` y `guestPrice`.
3. **Días de la Semana (`daysOfWeek`):** Array de enteros del 0 al 6 (o 1 al 7), permitiendo diferenciar precios de lunes a viernes respecto a fines de semana.
4. **Discriminación Horaria (Punta / Valle):** Reglas con `isPeakHour = true` y rango horario `startTime` - `endTime` (ej: 17:00 - 23:00).
5. **Suplemento de Iluminación (`lightSurcharge`):** Coste añadido opcional si la pista tiene luz (`hasLighting = true`) y la franja requiere iluminación artificial.

---

## 4. Casos de Uso (Gherkin)

### Escenario 1: Creación de pista de pádel por administrador de club
- **Dado** un usuario autenticado con rol `ADMIN` en el club "Central Pádel" (`club_id = "cp-1"`).
- **Cuando** envía una solicitud `POST /api/v1/facilities` con nombre "Pista Central Cristal", deporte `PADEL`, pista `INDOOR`, superficie `CRYSTAL`, luz `true`, franja `90` y jugadores `min: 4, max: 4`.
- **Entonces** el sistema persiste la instalación con `club_id = "cp-1"` y estado `isActive = true`.
- **Y** devuelve código de estado `201 Created`.

### Escenario 2: Intento de acceso a pistas de otro club
- **Dado** un administrador perteneciente al club "Club A".
- **Cuando** intenta consultar o modificar una instalación perteneciente al club "Club B".
- **Entonces** el sistema bloquea la acción con error `403 Forbidden` o `404 Not Found`.

### Escenario 3: Bloqueo de pista con fechas inválidas
- **Dado** un administrador en el panel de bloqueos.
- **Cuando** intenta programar un bloqueo con `startTime = "2026-10-25T18:00:00Z"` y `endTime = "2026-10-25T16:00:00Z"`.
- **Entonces** el sistema rechaza la petición con error `400 Bad Request` indicando que la fecha fin debe ser posterior a la de inicio.

### Escenario 4: Definición de tarifa punta con suplemento de luz
- **Dado** un club que aplica tarifa de 24€ a socios y 32€ a invitados de 17:00 a 23:00 con 4€ de suplemento de luz.
- **Cuando** el administrador crea la regla de tarificación en `/admin/pricing`.
- **Entonces** la regla queda guardada y disponible para la consulta en el motor de reservas.
