# Tasks: centralized-ui-services

**Fecha:** 2026-10-20  
**Estado:** 🟢 Completado  

---

## Fase 1: Creación de Servicios Centralizados en `@core`

- [x] **1.1:** Crear `NotificationService` en `projects/spt-app/src/app/core/services/notification.service.ts` con integración de `MessageService` e i18n (`ngx-translate`).
- [x] **1.2:** Crear `ConfirmDialogService` en `projects/spt-app/src/app/core/services/confirm-dialog.service.ts` con integración de `ConfirmationService` y presets de eliminación/confirmación.
- [x] **1.3:** Exportar `NotificationService` y `ConfirmDialogService` en `projects/spt-app/src/app/core/index.ts`.
- [x] **1.4:** Añadir pruebas unitarias para `NotificationService` y `ConfirmDialogService` en `@core`.

---

## Fase 2: Configuración del Shell Host (`spt-app`)

- [x] **2.1:** Configurar `ConfirmationService` y `MessageService` en `projects/spt-app/src/app/app.config.ts`.
- [x] **2.2:** Integrar el contenedor `<p-confirmdialog />` en `projects/spt-app/src/app/app.html` e importar `ConfirmDialogModule` en `app.ts`.
- [x] **2.3:** Asegurar estilos Athletic Luxury para `.p-confirmdialog` en `projects/spt-app/src/styles/components/_dialogs.scss`.

---

## Fase 3: Migración de Componentes en `spt-admin`

- [x] **3.1:** Migrar `FacilitiesListComponent`:
  - Reemplazar inyecciones locales de `MessageService` por `NotificationService`.
  - Reemplazar confirmación nativa `confirm(...)` por `ConfirmDialogService.confirmDelete`.
  - Remover `<p-toast>` del HTML y `providers: [MessageService]`.
- [x] **3.2:** Migrar `FacilityBlocksComponent`:
  - Reemplazar `MessageService` por `NotificationService`.
  - Reemplazar confirmaciones por `ConfirmDialogService`.
  - Remover `<p-toast>` del HTML y `providers: [MessageService]`.
- [x] **3.3:** Migrar `PricingListComponent`:
  - Reemplazar `MessageService` por `NotificationService`.
  - Reemplazar confirmaciones de eliminación por `ConfirmDialogService`.
  - Remover `<p-toast>` del HTML y `providers: [MessageService]`.

---

## Fase 4: Pruebas y Validación

- [x] **4.1:** Actualizar y ejecutar tests unitarios de `spt-admin` (`npx ng test spt-admin --watch=false`).
- [x] **4.2:** Actualizar y ejecutar tests unitarios de `spt-app` (`npx ng test spt-app --watch=false`).
- [x] **4.3:** Validar navegación interactiva y visual en navegador local.
