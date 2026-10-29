# Propuesta: Matriz Jerárquica de Dashboards y KPIs por Rol de Usuario

## 1. Contexto y Problema de Negocio
Actualmente, tanto el panel de administración (`spt-admin`) como el portal del jugador (`spt-portal`) disponen de vistas iniciales estáticas con accesos directos simples.
Existe la necesidad de dotar a cada tipo de usuario de métricas e indicadores de rendimiento (KPIs) en tiempo real adaptados exactamente a su nivel de responsabilidad y gobernanza, siguiendo una **jerarquía acumulativa y segura**:
- **SUPERADMIN:** Supervisión macro de la plataforma SaaS (clubes, facturación global, usuarios) y capacidad de inspección completa de cualquier club (KPIs de Superadmin + Owner + Staff).
- **OWNER / ADMIN DE CLUB:** Supervisión ejecutiva y operativa completa de su club: sus métricas de negocio y financieras MÁS todas las métricas operativas del día a día (KPIs de Owner + Staff).
- **STAFF / RECEPCIÓN:** Operativa diaria en pista y mostrador (Ocupación hoy, disponibilidad inmediata próximas 3h, cobros pendientes, bloqueos). No tienen visibilidad de facturación agregada ni márgenes (confidencialidad financiera).
- **JUGADOR / SOCIO:** Panel personal deportivo en el Portal (próxima reserva, actividad mensual, nivel de juego, gasto personal, balance de partidas).

## 2. Matriz Jerárquica de Roles y KPIs

| Rol | Ámbito | KPIs y Componentes Visibles | Gráficas PrimeNG (`<p-chart>`) |
| :--- | :--- | :--- | :--- |
| **SUPERADMIN** | Plataforma Global + Selector Club | - Total Clubes activos / nuevos<br>- GMV Global (€)<br>- Usuarios registrados totales<br>+ Todos los KPIs de Owner y Staff del club seleccionado | - Evolución GMV global<br>- Gráficas completas del club seleccionado |
| **OWNER / ADMIN** | Club Específico | - **Métricas Staff (Operativa Hoy):** Ocupación hoy, Pistas libres 3h, Cobros pendientes, Bloqueos hoy<br>- **Métricas Owner (Mes):** Facturación mes (€), % Ocupación global, Nuevos socios, Ticket medio | - Tendencia de Ocupación e Ingresos (Líneas)<br>- Facturación Pádel vs Tenis (Donut / MeterGroup) |
| **STAFF** | Club Específico | - Ocupación hoy (% y reservas)<br>- Pistas libres en próximas 3h<br>- Cobros / Check-ins pendientes hoy<br>- Bloqueos de mantenimiento activos hoy | - Medidor de ocupación de turno actual (`p-progressbar` / mini-donut) |
| **JUGADOR / SOCIO** | Perfil Personal (Portal) | - Próxima reserva activa (cuenta atrás)<br>- Partidos jugados en el mes<br>- Nivel estimado / Rating Stitch<br>- Gasto deportivo acumulado (€) | - Historial de actividad mensual (Barras compactas)<br>- Radar de juego personal |

## 3. Criterios de Aceptación (CA)
- **CA-1 (Segmentación Segura):** El backend debe restringir estrictamente las métricas devueltas según el rol del usuario autenticado (ej. Staff nunca recibe importes de facturación del club).
- **CA-2 (Aislamiento Multi-Tenant):** Toda consulta de club incluye obligatoriamente `club_id` indexado. El Superadmin puede consultar cualquier club; Owners, Staff y Socios únicamente el club al que pertenecen.
- **CA-3 (Visualización PrimeNG):** Los gráficos utilizan `<p-chart>` (Chart.js ^4.5.1 ya instalado) y respetan la paleta corporativa Stitch Neon Pink (`#FF2D78`), fuentes y modo oscuro reactivo.
- **CA-4 (Dashboard Jugador):** El portal del socio (`spt-portal/portal-home`) integra su bloque de KPIs personales con enlace directo a reservar pista si no tiene próximas reservas.
- **CA-5 (Responsividad e i18n):** Adaptación completa móvil/tablet (`@include mobile-or-tablet`) y claves en `es.json`.
