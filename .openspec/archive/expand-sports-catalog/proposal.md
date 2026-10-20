# Propuesta: Ampliación del Catálogo de Deportes (`expand-sports-catalog`)

## Contexto de Negocio
`spt-app-project` está diseñado tanto para clubes privados de raqueta como para centros polideportivos municipales y complejos multi-deporte. Actualmente, el enum `SportType` solo contiene 6 deportes (`PADEL`, `TENNIS`, `FOOTBALL_7`, `FOOTBALL_11`, `BASKETBALL`, `MULTI_SPORT`).

Para dar soporte a la oferta real de los polideportivos municipales y ayuntamientos, se requiere ampliar el catálogo con deportes de raqueta adicionales, deportes de pista cubierta, arena y disciplinas de uso habitual en instalaciones públicas.

## Deportes a Incorporar
1. **Deportes solicitados:**
   - `PICKLEBALL` (Pickleball)
   - `SQUASH` (Squash)
   - `BADMINTON` (Bádminton)
   - `VOLLEYBALL` (Voleibol)
   - `BEACH_VOLLEY` (Vóley Playa)
   - `FRONTON` (Frontón)
   - `INDOOR_FRONTON` (Frontón Cubierto)
   - `FUTSAL` (Fútbol Sala)
2. **Deportes municipales adicionales (oferta estándar de ayuntamientos en España):**
   - `HANDBALL` (Balonmano)
   - `TABLE_TENNIS` (Tenis de Mesa / Ping Pong)
   - `ATHLETICS_TRACK` (Pista de Atletismo)
   - `SWIMMING_LANE` (Calle de Natación / Piscina)
   - `CLIMBING_WALL` (Rocódromo / Escalada)

## Solución Propuesta
1. **Base de Datos:** Ampliar el enum `SportType` en `apps/backend/prisma/schema.prisma` y generar la migración aditiva SQL en PostgreSQL.
2. **Backend & OpenAPI:** Actualizar tipos, exportar OpenAPI 3.0 actualizado (`npm run swagger:export`).
3. **Frontend & Sincronización:**
   - Regenerar tipos de cliente mediante Orval (`npm run api:generate`).
   - Declarar todas las etiquetas traducidas en `apps/frontend/projects/spt-app/src/assets/i18n/es.json` bajo `SPORTS.<DEPORTE>`.
   - Replicar a las carpetas públicas de assets.
4. **Selectores:** Comprobar que los selectores de deportes en los microfrontends (`spt-admin`, `spt-portal`) muestren las opciones correctamente traducidas.

## Criterios de Aceptación (CA)
- **CA-1: Migración no destructiva en BBDD:** La migración añade valores al enum existente mediante `ALTER TYPE "SportType" ADD VALUE` sin pérdida de datos ni bloqueo de tablas.
- **CA-2: Tipado completo en TypeScript:** El enum generado por Prisma y Orval en `@core` incluye todos los 19 deportes.
- **CA-3: Traducciones al 100%:** Cada valor de deporte tiene su traducción en español en `es.json` bajo `SPORTS.*`.
- **CA-4: Pruebas unitarias en verde:** La suite de tests de backend y microfrontends compila y pasa sin regresiones.
