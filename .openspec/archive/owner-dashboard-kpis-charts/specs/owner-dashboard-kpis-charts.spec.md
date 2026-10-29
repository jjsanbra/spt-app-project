# Especificación: Dashboards y KPIs Jerárquicos por Rol de Usuario

## Casos de Uso y Reglas de Negocio

### CU-1: Staff — Acceso a Operativa Inmediata
- **Dado** que un usuario con rol `STAFF` accede a `/admin/dashboard`.
- **Cuando** carga la página.
- **Entonces** visualiza exclusivamente el bloque "Operativa de Hoy": ocupación actual, pistas libres en próximas 3 horas, cobros pendientes y bloqueos de mantenimiento.
- **Y** no tiene acceso a facturación, márgenes ni gráficas financieras.

### CU-2: Owner / Admin de Club — Visión Integral (Staff + Negocio)
- **Dado** que un usuario con rol `OWNER` o `ADMIN` accede a `/admin/dashboard`.
- **Cuando** carga la página.
- **Entonces** visualiza el bloque "Operativa de Hoy" Y el bloque "Rendimiento y Negocio del Mes" (facturación, ocupación global, nuevas altas, ticket medio).
- **Y** visualiza las gráficas analíticas de evolución de ocupación (líneas) y facturación por deporte (donut).

### CU-3: Superadmin — Métricas Globales y Supervisión de Cualquier Club
- **Dado** que un `SUPERADMIN` accede a `/admin/dashboard`.
- **Cuando** carga la página.
- **Entonces** visualiza los KPIs macro de plataforma SaaS (Clubes activos, GMV global, Usuarios).
- **Y** cuenta con un selector de club para cargar e inspeccionar la vista completa de cualquier centro deportivo.

### CU-4: Jugador / Socio — Dashboard Personal en el Portal
- **Dado** que un socio autenticado accede a `/portal` (`PortalHomeComponent`).
- **Cuando** carga la página.
- **Entonces** visualiza su próxima reserva activa, sus partidos disputados en el mes, su nivel estimado y su gasto deportivo acumulado con accesos directos rápidos a reservar.
