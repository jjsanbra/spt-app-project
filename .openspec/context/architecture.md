# Arquitectura del Sistema (SPT App Project)

## 1. Visión General
**SPT App** es una plataforma SaaS Multi-tenant de alto rendimiento para la gestión integral de reservas e instalaciones en centros deportivos (pádel, tenis, fútbol, baloncesto, etc.). Está estructurada como un monorepo modular compuesto por un backend robusto en **NestJS** con **Prisma ORM** sobre **PostgreSQL**, colas asíncronas en **Redis / BullMQ**, y una suite de microfrontends desacoplados en **Angular 22** orquestados mediante **Native Federation**.

---

## 2. Componentes del Sistema

### 2.1 Backend (`apps/backend`)
* **Framework:** NestJS 10 (TypeScript).
* **ORM & Base de Datos:** Prisma 5 conectando a PostgreSQL 16 con estrategia **Row-Level Security** multi-tenant basada en `club_id`.
* **Colas y Tareas en Segundo Plano:** Redis 7 con BullMQ (procesamiento de cancelaciones automáticas, notificaciones por email/SMS/Push, expiración de pagos diferidos).
* **Seguridad y Hardening:** Helmet, CORS restrictivo por entorno, Rate Limiting (Throttler), contraseñas con bcrypt y autenticación JWT propia (Passport).
* **Contrato API (OpenAPI 3.0):** Generado automáticamente con `@nestjs/swagger` y exportable a `apps/backend/openapi.json`.

### 2.2 Microfrontends (`apps/frontend/projects`)
* **Shell Host:** `spt-app` (Puerto 4200) — Enrutamiento principal, navbar, footer, contexto del club activo (`x-tenant-id`), Guards de autenticación global, tema PrimeNG y configuración de `ngx-translate`.
* **Microfrontends Remotos:**
  * **`spt-admin` (Puerto 4201):** Panel de administración del club deportivo. Gestión de pistas e instalaciones, configuración de franjas horarias y reglas de precios, cuadrante de bloqueos por mantenimiento/torneos, recepción y registro de cobros presenciales/TPV, reportes y métricas con Chart.js.
  * **`spt-portal` (Puerto 4202):** Portal público y de socios. Búsqueda y filtrado de pistas por deporte/superficie, cuadrante interactivo de disponibilidad, motor de reservas completas y partidas abiertas por plazas, unión y seguimiento de partidas.
  * **`spt-users` (Puerto 4203):** Autenticación y registro global, selector de club activo, perfil de usuario, monedero virtual del club, historial de reservas y pagos.

### 2.3 Capa Compartida (`@core` / `libs/core`)
* Centraliza los contratos de datos generados mediante **Orval** a partir del `openapi.json` del backend.
* **Interceptor de Autenticación y Multi-tenancy:** Inyecta automáticamente `Authorization: Bearer <token>` y la cabecera `x-tenant-id` en todas las peticiones HTTP.
* Enums de dominio compartidos, utilidades de fecha y formateo monetario, y guards de navegación.

---

## 3. Integración de Contratos con Orval (Spec-Driven API)
1. El backend NestJS define los DTOs y controladores decorados con Swagger.
2. El script `npm run swagger:export` genera `apps/backend/openapi.json`.
3. Orval compila este esquema en clientes tipados Angular e interfaces TypeScript en `@core`.
4. Todos los microfrontends (`spt-app`, `spt-admin`, `spt-portal`, `spt-users`) consumen los servicios tipados sin declarar interfaces manuales ni duplicar contratos.
