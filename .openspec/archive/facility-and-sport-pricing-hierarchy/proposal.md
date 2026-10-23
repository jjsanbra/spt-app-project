# Propuesta: Jerarquía Inteligente y Gestión Bidireccional de Tarifas por Deporte y Pista

## 1. Contexto y Problema de Negocio
En los centros deportivos coexisten diferentes disciplinas (Pádel, Tenis, Fútbol, Baloncesto) y distintos tipos de instalaciones (pistas estándar, pistas panorámicas premium, pistas cubiertas/climatizadas). Cada una de ellas posee estructuras de costes y demandas dispares:
- Un club no cobra lo mismo por una hora de Tenis individual que por 90 minutos de Pádel o una hora de Fútbol 7.
- Dentro del mismo deporte, una "Pista 1 Central Panorámica" o "Pista Cubierta" suele tener un precio superior al de una pista exterior estándar.
- Actualmente, la pantalla de tarifas en `spt-admin` no permite asociar deportes ni pistas específicas en su interfaz, y la pantalla de instalaciones (`facilities`) no muestra ni permite configurar los precios de la pista, obligando a manejar precios genéricos a nivel de club.

## 2. Solución Propuesta (Opción 3 Mejorada)
Implementar una **Jerarquía Inteligente y Bidireccional de Tarificación** que permita una gestión flexible tanto desde la vista de Tarifas como desde la propia Pista:

1. **Resolución Jerárquica de Precios (Motor de Precios en Backend):**
   Al calcular el importe de una reserva o consultar tarifas de una pista, el motor resuelve la regla de mayor especificidad:
   $$\text{Pista Específica (facilityId)} \succ \text{Por Deporte (sportType)} \succ \text{General del Club}$$
   Filtrando por día de la semana (`daysOfWeek`), rango horario (`startTime`/`endTime`) y orden de prioridad (`priority`).

2. **Gestión desde el Módulo de Tarifas (`/admin/pricing`):**
   - Selector de **Ámbito de Aplicación**:
     - `GLOBAL` (Todo el centro).
     - `SPORT` (Por disciplina deportiva: Pádel, Tenis, etc.).
     - `FACILITY` (Pista específica del club).
   - Visualización enriquecida en la tabla de tarifas con tags distintivos de PrimeNG (`Global`, `Deporte: Pádel`, `Pista: Pista 1 Central`).

3. **Gestión Directa desde el Módulo de Pistas (`/admin/facilities`):**
   - **Columna de Tarifa / Precio Base** en la tabla de pistas: muestra los precios de Socio e Invitado aplicables y el origen de la regla (Tag: *Específica*, *Por Deporte* o *General*).
   - **Configuración Rápida en el Modal de Pista**: opción para elegir entre *Heredar tarifa por deporte/club* o *Fijar precio base para esta pista* (creando o actualizando automáticamente la regla específica de tarificación vinculada a la pista).

## 3. Criterios de Aceptación (CA)
- **CA-1 (Ámbitos en Tarifas):** El administrador puede crear/editar tarifas asignando ámbito Global, por Deporte o por Pista concreta.
- **CA-2 (Visualización en Tabla de Tarifas):** La tabla de tarifas muestra claramente el ámbito de aplicación (`Aplica a`), permitiendo filtrar y ordenar.
- **CA-3 (Visualización en Tabla de Pistas):** La tabla de pistas muestra el precio base vigente (socio e invitado) y la fuente de la tarifa.
- **CA-4 (Configuración en Modal de Pista):** El modal de pista permite asociar una tarifa existente o fijar precios base directos para la pista.
- **CA-5 (Resolución Jerárquica Backend):** `BookingsService` y el cálculo de reservas resuelven con exactitud la regla más específica aplicable.
- **CA-6 (Aislamiento Multi-tenant):** Toda consulta y asignación de reglas de precios y pistas filtra obligatoriamente por `clubId`.
- **CA-7 (Compatibilidad y Cobertura):** La cobertura de pruebas unitarias en backend y frontend se mantiene >= 80% y la base de datos no sufre cambios destructivos.
