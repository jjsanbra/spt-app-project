# Especificación Funcional: Duración por Deporte y Cuadrícula Continua Tipo Google Calendar

**Fecha:** 2026-10-23
**Versión:** 0.1.0

---

## 1. Descripción Funcional

Este evolutivo estandariza la duración de los turnos de juego por deporte en el sistema (eliminando mezclas incoherentes de duraciones múltiples en un mismo deporte) y rediseña la cuadrícula de reservas para que muestre una escala de tiempo continua y uniforme, evitando la aparición de filas con horas solapadas/duplicadas en el eje vertical.

---

## 2. Reglas de Negocio

- **RN-01 (Duración Canónica por Deporte):** Cada deporte tiene asignada una duración estándar:
  - `PADEL`: 90 minutos.
  - `TENNIS`, `FOOTBALL_7`, `FOOTBALL_11`, `FUTSAL`, `BASKETBALL`, `VOLLEYBALL`, `BEACH_VOLLEY`, `PICKLEBALL`, `SQUASH`, `BADMINTON`, `HANDBALL`, `MULTI_SPORT`: 60 minutos.
- **RN-02 (Auto-asignación en Admin):** Al crear o editar una pista en `spt-admin`, al cambiar el deporte seleccionado el campo de duración de turno (`defaultSlotMinutes`) adopta automáticamente la duración canónica de dicho deporte.
- **RN-03 (Sin Filas Horarias Solapadas en Cuadrícula):** La cuadrícula de reservas nunca debe presentar filas adyacentes solapadas (ej. `08:00 - 09:00` y `08:00 - 09:30`) en la misma tabla.
- **RN-04 (Agrupación Armónica en Vista Completa):** Cuando se consultan "Todos los deportes", la vista debe presentar las pistas organizadas por deporte, permitiendo que cada deporte mantenga su escala temporal regular (90 min en pádel, 60 min en tenis/fútbol).
- **RN-05 (Reserva en Slots Vacíos y Cutoff):** Se mantiene la capacidad de reservar tanto en slots pregenerados como en celdas vacías (`onEmptySlotClick`), validando siempre la regla de corte de 2 horas de antelación y la duración exacta del deporte.

---

## 3. Casos de Uso

### CU-01: Administrador configura una pista deportiva
**Actor:** Administrador del Club (`spt-admin`)  
**Precondición:** El usuario tiene sesión iniciada con rol `ADMIN` o `SUPER_ADMIN`.  
**Flujo principal:**
1. El usuario accede a *Pistas e Instalaciones* y pulsa *Añadir Pista*.
2. El usuario selecciona el deporte `PADEL`.
3. El sistema asigna automáticamente `90 minutos` al campo de duración de franja.
4. Si el usuario cambia el deporte a `TENNIS`, el sistema actualiza automáticamente el campo a `60 minutos`.
5. El usuario guarda la pista.

**Postcondición:** La pista queda registrada con la duración propia de su deporte.

---

### CU-02: Usuario consulta la cuadrícula de reservas
**Actor:** Socio o Deportista (`spt-portal`)  
**Precondición:** El centro deportivo tiene pistas de pádel (90m) y tenis/fútbol (60m).  
**Flujo principal:**
1. El usuario accede a *Reserva de Pistas* en el portal.
2. Si selecciona un deporte concreto (ej. Pádel), la cuadrícula muestra una escala temporal continua limpia de 90 min (`08:00-09:30`, `09:30-11:00`...).
3. Si selecciona "Todos los deportes", el sistema organiza la disponibilidad sin intercalar filas solapadas en la misma columna, permitiendo una lectura intuitiva estilo calendario.
4. Al hacer clic en un slot libre o vacío disponible, se abre la modal de confirmación con la duración exacta de la pista.

**Postcondición:** El usuario visualiza los turnos claros y reserva sin confusión.
