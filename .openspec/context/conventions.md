# Convenciones de Desarrollo y Contratos (SPT App)

## 1. Estándares de la API REST y Multi-Tenancy
* **Prefijo base:** `/api/v1`
* **Cabecera de Tenant Obligatoria:** `x-tenant-id: <uuid-del-club>` en todas las peticiones acotadas a un centro deportivo.
* **Formato de respuesta estándar:**
  ```json
  {
    "data": { ... } | [ ... ],
    "message": "Mensaje descriptivo opcional",
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 20
    }
  }
  ```
* **Formato de errores estándar (NestJS Exception Filter):**
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Mensaje legible o array de validaciones de class-validator",
    "timestamp": "2026-10-20T05:00:00.000Z",
    "path": "/api/v1/bookings"
  }
  ```
* **Códigos HTTP principales:**
  * `200 OK`: Consulta o actualización exitosa (GET, PUT, PATCH).
  * `201 Created`: Recurso creado exitosamente (POST).
  * `400 Bad Request`: Error de validación en DTOs (`ValidationPipe` con `whitelist: true`).
  * `401 Unauthorized`: Token JWT ausente, expirado o con firma no válida.
  * `403 Forbidden`: Usuario sin membresía o con rol insuficiente en el club indicado.
  * `404 Not Found`: Recurso no encontrado o no perteneciente al club activo.
  * `409 Conflict`: Conflicto de concurrencia (ej. pista ya ocupada en ese intervalo horario).
  * `429 Too Many Requests`: Exceso de peticiones detectado por `ThrottlerGuard`.

---

## 2. Tipado y Angular (Frontend)
* **Prohibición de `any`:** Ningún modelo compartido o servicio debe usar el tipo `any`.
* **Reactividad con Signals:** Emplear Signals (`signal()`, `computed()`, `effect()`) para el estado local y reactivo de componentes en lugar de suscripciones manuales a RxJS cuando sea posible.
* **Consumo Exclusivo de `@core`:** Los componentes de los microfrontends remotos no declaran interfaces de datos locales para la API; importan los tipos generados por Orval desde `@core`.
* **Componentes Standalone:** Todos los componentes de Angular se declaran Standalone.

---

## 3. UI y Componentes (PrimeNG)
* **Componentes Nativos PrimeNG:** Utilizar siempre los componentes oficiales (`p-table`, `p-dialog`, `p-drawer`, `p-tag`, `p-badge`, `p-select`, `p-datepicker`, `p-confirmDialog`, etc.) en lugar de estructuras HTML manuales.
* **USO OBLIGATORIO DE `pButton`:** NUNCA utilizar `<button>` nativo sin la directiva `pButton`. Configurar atributos (`severity`, `[outlined]="true"`, etc.) e importar `ButtonModule`.

---

## 4. Design System, Tokens y Estilos Modulares
* **Design System Central (`projects/spt-app/src/styles/`):**
  * Aloja el tema global, tokens semánticos y overrides de PrimeNG (`_variables.scss`, `_responsive.scss`, `_buttons.scss`, `_tables.scss`, `_forms.scss`).
  * No debe albergar maquetaciones ni vistas de negocio exclusivas de un microfrontend.
* **Estilos Locales de Microfrontend (`projects/<mfe>/src/app/...`):**
  * Las vistas de negocio residen en sus archivos `.component.scss` con encapsulamiento nativo (`ViewEncapsulation.Emulated`).
* **CERO VALORES HARDCODEADOS:** Prohibido usar colores hexadecimales, píxeles o rems literales en los SCSS. Consumir obligatoriamente los tokens de `_variables.scss` (`var(--spacing-md)`, `var(--primary-color)`, `var(--surface-card)`, etc.).
* **MIXINS RESPONSIVOS:** Prohibido escribir `@media` manuales. Utilizar obligatoriamente los mixins de breakpoint:
  ```scss
  @include mobile { ... }
  @include tablet { ... }
  @include desktop { ... }
  ```

---

## 5. Internacionalización (i18n)
* **CERO TEXTOS HARDCODEADOS:** Todo texto visible en HTML o TypeScript debe resolverse mediante `ngx-translate`:
  ```html
  <span class="font-bold">{{ 'BOOKINGS.CONFIRM_TITLE' | translate }}</span>
  ```
* Todas las nuevas claves deben añadirse en inglés, mientras las traducciones son en español, ordenadamente al diccionario oficial: `projects/spt-app/src/assets/i18n/es.json`.

---

## 6. Integridad de Base de Datos y Producción
* **Evaluación de Riesgo de Migración:** Antes de aplicar cualquier cambio de esquema en Prisma (`schema.prisma`) o ejecutar migraciones SQL en PostgreSQL, se debe evaluar formalmente el impacto en multi-tenancy, rendimiento de índices y riesgo de pérdida de datos.
* **Bloqueo y Consulta Previa:** Si existe riesgo de operación destructiva (`DROP COLUMN`, `RENAME`, cambio de tipo con pérdida de precisión), se debe detener el proceso, advertir al usuario y solicitar confirmación expresa antes de ejecutar la migración.
