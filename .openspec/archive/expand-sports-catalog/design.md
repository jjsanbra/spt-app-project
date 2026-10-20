# Diseño Técnico: Ampliación del Catálogo de Deportes (`expand-sports-catalog`)

## 🛡️ Evaluación Obligatoria de Riesgo en Base de Datos

- **Tipo de Operación:** Aditiva en Enum PostgreSQL (`ALTER TYPE "SportType" ADD VALUE '...'`).
- **Análisis de Impacto:**
  - **Pérdida de datos:** Cero. No se eliminan ni modifican registros existentes de `facilities`, `pricing_rules` o `bookings`.
  - **Bloqueo de tablas:** En PostgreSQL moderno, `ALTER TYPE ... ADD VALUE` se ejecuta casi instantáneamente sin reescribir tablas.
  - **Retrocompatibilidad:** Todos los datos con `PADEL`, `TENNIS`, etc. permanecen intactos y válidos.
- **Veredicto de Riesgo:** **BAJO / NO DESTRUCTIVO**. Seguro para producción.

---

## 🏛️ Esquema Prisma (`schema.prisma`)

```prisma
enum SportType {
  PADEL
  TENNIS
  FOOTBALL_7
  FOOTBALL_11
  FUTSAL
  BASKETBALL
  PICKLEBALL
  SQUASH
  BADMINTON
  VOLLEYBALL
  BEACH_VOLLEY
  FRONTON
  INDOOR_FRONTON
  HANDBALL
  TABLE_TENNIS
  ATHLETICS_TRACK
  SWIMMING_LANE
  CLIMBING_WALL
  MULTI_SPORT
}
```

---

## 🌐 Mapeo de Internacionalización (`es.json`)

```json
"SPORTS": {
  "PADEL": "Pádel",
  "TENNIS": "Tenis",
  "FOOTBALL_7": "Fútbol 7",
  "FOOTBALL_11": "Fútbol 11",
  "FUTSAL": "Fútbol Sala",
  "BASKETBALL": "Baloncesto",
  "PICKLEBALL": "Pickleball",
  "SQUASH": "Squash",
  "BADMINTON": "Bádminton",
  "VOLLEYBALL": "Voleibol",
  "BEACH_VOLLEY": "Vóley Playa",
  "FRONTON": "Frontón",
  "INDOOR_FRONTON": "Frontón Cubierto",
  "HANDBALL": "Balonmano",
  "TABLE_TENNIS": "Tenis de Mesa",
  "ATHLETICS_TRACK": "Pista de Atletismo",
  "SWIMMING_LANE": "Calle de Natación",
  "CLIMBING_WALL": "Rocódromo / Escalada",
  "MULTI_SPORT": "Polideportivo / Multideporte"
}
```
