# Propuesta: Configuración y Horarios del Club (`club-settings-schedule`)

## Contexto de Negocio
En el sistema SaaS multi-tenant `spt-app-project`, cada centro deportivo (`Club`) posee una configuración general que rige el funcionamiento de sus instalaciones y el motor de reservas:
1. **Horarios operativos**: Hora de apertura general (`openingHour`, ej: 8) y hora de cierre general (`closingHour`, ej: 23).
2. **Duración predeterminada de slots**: Duración habitual de reserva (`slotDurationMinutes`, ej: 60 o 90 minutos).
3. **Modalidad de pago**: Modo admitido por el club (`paymentMode`: `PRESENTIAL`, `ONLINE`, `HYBRID`).
4. **Antelación para partidas abiertas**: Horas mínimas requeridas para convocar o confirmar partidas (`openGameMinNoticeHours`).
5. **Datos identificativos y de contacto**: Nombre comercial, descripción, teléfono, dirección, ciudad y código postal.

Actualmente, estos campos existen en el modelo de Prisma `Club`, pero no disponemos de:
- Endpoints de API REST seguros y protegidos por rol (`OWNER` y `ADMIN`) para consultar y actualizar la configuración del club activo.
- Una vista en `spt-admin` donde los administradores puedan ajustar estos parámetros con formularios reactivos y selectores claros.

## Solución Propuesta

### 1. Backend (`apps/backend`)
- **Controlador y Servicio (`ClubsController` & `ClubsService`)**:
  - `GET /api/v1/clubs/settings`: Devuelve la configuración y detalles del club activo extraído del tenant context (`CurrentTenant`).
  - `PATCH /api/v1/clubs/settings`: Permite actualizar datos de contacto, horarios (`openingHour`, `closingHour`, validando que `openingHour < closingHour`), `slotDurationMinutes`, `openGameMinNoticeHours` y `paymentMode`.
  - Protegido por `JwtAuthGuard`, `TenantGuard` (`x-tenant-id`) y `RolesGuard` (`@Roles('OWNER', 'ADMIN')`).

### 2. Frontend (`apps/frontend/projects/spt-admin`)
- **Página de Ajustes del Club (`ClubSettingsComponent`)**:
  - Ruta `/admin/settings` accesible desde el layout de `spt-admin`.
  - Formulario reactivo estructurado por secciones:
    - **Información General & Contacto**: Nombre, descripción, teléfono, email, dirección, ciudad, código postal.
    - **Horarios y Funcionamiento**: Horario apertura (8:00 - 23:00), duración por defecto de franjas (30, 60, 90, 120 min), horas mínimas de antelación.
    - **Modalidad de Pago**: Selector claro (`PRESENTIAL`, `ONLINE`, `HYBRID`) con descripciones contextuales.
  - Notificaciones de éxito mediante `NotificationService` (`@core`).
  - 100% traducido con `ngx-translate` en `es.json`.

## Criterios de Aceptación (CA)
- **CA-1:** Solo usuarios con rol `OWNER` o `ADMIN` en el club pueden modificar la configuración.
- **CA-2:** Aislamiento multi-tenant estricto: la configuración modificada solo afecta al `clubId` del contexto.
- **CA-3:** Validación estricta de coherencia horaria: `openingHour` debe ser estrictamente menor que `closingHour` (entre 0 y 24).
- **CA-4:** Tipos OpenAPI sincronizados con Orval en `@core`.
- **CA-5:** Directivas PrimeNG (`pButton`, `pInputText`, `pSelect`, `pInputNumber`) y tokens de diseño SCSS sin valores hardcodeados.
