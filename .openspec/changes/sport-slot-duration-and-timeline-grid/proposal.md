# Propuesta: Estandarización de Duración de Turnos por Deporte y Cuadrícula Continua Tipo Google Calendar

**Fecha:** 2026-10-23
**Estado:** 🟡 En Revisión
**Autor:** Antigravity AI & Equipo de Desarrollo

---

## 1. Contexto y Motivación

En la vista actual de reservas (`bookings-grid` en `spt-portal`), cuando se visualiza la cuadrícula con el filtro "Todos los deportes", se genera un problema visual y de usabilidad:
- Las pistas de **Pádel** están configuradas en turnos de **90 minutos** (`08:00-09:30`, `09:30-11:00`, `11:00-12:30`...).
- Las pistas de **Tenis** y **Fútbol** están configuradas en turnos de **60 minutos** (`08:00-09:00`, `09:00-10:00`, `10:00-11:00`...).
- El algoritmo anterior combinaba todos los textos de horario en un `Set` único ordenado alfabéticamente, generando filas intercaladas como `08:00 - 09:00`, `08:00 - 09:30`, `09:00 - 10:00`, `09:30 - 11:00`...
- Esto provocaba la percepción de turnos repetidos o solapados en el eje vertical y dejaba huecos vacíos (`—`) porque una pista de 90 minutos nunca encaja en una fila de 60 minutos.

Además, desde la perspectiva de negocio y gestión deportiva:
1. Cada deporte debe tener una **única duración oficial predeterminada** para evitar la fragmentación horaria en las pistas.
2. La cuadrícula de reservas debe presentar una **escala de tiempo continua y uniforme** (estilo Google Calendar), donde el eje vertical muestra horas regulares y cada pista posiciona sus bloques de juego según su duración real y hora de inicio.

---

## 2. Solución Propuesta

### 2.1 Estandarización de Duración por Deporte (Backend & Admin)
- Definir un catálogo canónico de duración predeterminada por deporte:
  - **PADEL:** 90 minutos (1,5 h)
  - **TENNIS:** 60 minutos (1 h)
  - **FOOTBALL_7 / FOOTBALL_11 / FUTSAL:** 60 minutos (1 h)
  - **BASKETBALL / VOLLEYBALL / HANDBALL:** 60 minutos (1 h)
  - **PICKLEBALL / SQUASH / BADMINTON:** 60 minutos (1 h)
  - **MULTI_SPORT:** 60 minutos (1 h)
- En `spt-admin` ([facilities-list.component.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-admin/src/app/pages/facilities/facilities-list.component.ts)), al seleccionar el deporte en el formulario de pista, el campo `defaultSlotMinutes` se auto-asigna automáticamente con la duración estándar del deporte seleccionado.
- En `apps/backend/prisma/seed.ts` y migraciones, alinear todas las pistas para garantizar consistencia con la duración de su deporte.

### 2.2 Cuadrícula Temporal Continua Estilo Google Calendar (Frontend `spt-portal`)
- **Eje de tiempo regular y continuo:**
  - En lugar de computar filas por textos de slots variables (`"08:00 - 09:30"` vs `"08:00 - 09:00"`), la cuadrícula utiliza una escala horaria continua basada en el horario de apertura y cierre del club (ej. cada hora o cada 30 minutos).
- **Renderizado por columnas proporcionales:**
  - Cada pista renderiza su lista secuencial de turnos en su propia columna.
  - Al filtrar por un deporte (ej: Pádel), la tabla muestra la secuencia uniforme de 90 minutos.
  - Al visualizar "Todos los deportes", la matriz muestra los bloques agrupados de forma limpia o estructurados por deporte en bloques armonizados, sin intercalar horas solapadas en la misma columna de etiquetas.

---

## 3. Criterios de Aceptación (CA)

- [ ] **CA-01 (Duración Única por Deporte):** Cada deporte tiene una duración predeterminada única y canónica (Pádel = 90 min, Tenis = 60 min, Fútbol = 60 min, etc.).
- [ ] **CA-02 (Auto-asignación en Admin):** Al crear o editar una pista en `spt-admin`, al seleccionar el tipo de deporte el campo `defaultSlotMinutes` se actualiza automáticamente con la duración del deporte.
- [ ] **CA-03 (Eje Temporal Continuo y Sin Solapes en Grid):** La vista de cuadrícula de reservas (`bookings-grid`) elimina las filas con horas intercaladas y solapadas. El eje temporal es continuo y predecible.
- [ ] **CA-04 (Visualización Armónica por Deporte / Timeline):** Los turnos se representan en bloques visuales acordes a su horario real (estilo Google Calendar), garantizando que las pistas con diferente duración no generen filas huérfanas con guiones `—` innecesarios.
- [ ] **CA-05 (Pruebas Unitarias y Build):** 100% de tests unitarios pasando en backend y frontend (cobertura >= 80% en código nuevo/modificado) y compilación limpia con `npm run build:all`.

---

## 4. Impacto Estimado

- **Backend:** 🟢 Bajo (alineación de duraciones por deporte en seed y validación en servicio de instalaciones).
- **Frontend:** 🟡 Medio (actualización de formulario en `spt-admin` y rediseño del cálculo de filas en `spt-portal/bookings-grid`).
- **Base de datos:** 🟢 Nulo (la columna `default_slot_minutes` ya existe en la tabla `facilities`, no requiere migraciones destructivas ni cambios de esquema Prisma).
- **Riesgo:** 🟢 Bajo.

---

## 5. Dependencias

- Ninguna dependencia bloqueante previa.
