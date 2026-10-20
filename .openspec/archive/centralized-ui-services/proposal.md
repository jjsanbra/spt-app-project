# Proposal: centralized-ui-services

**Fecha:** 2026-10-20  
**Estado:** 🟢 Aprobado / Implementado  
**Autor:** Antigravity AI & Equipo de Desarrollo Frontend  

---

## 1. Contexto y Motivación

Actualmente, múltiples componentes y vistas de la aplicación (en especial dentro del microfrontend `spt-admin` como `facilities-list`, `pricing-list` y `facility-blocks`) implementan de manera aislada y repetitiva:
1. **Etiquetas `<p-toast>` locales:** Cada plantilla incluye su propio `<p-toast></p-toast>`, requiriendo declarar `providers: [MessageService]` y construir objetos `{ severity, summary, detail }` manualmente con cadenas de traducción.
2. **Falta de Confirmaciones Estandarizadas:** Las acciones destructivas o de confirmación (como eliminar instalaciones, deshabilitar pistas o cancelar reglas tarifarias) no disponen de un flujo reactivo unificado mediante servicio, obligando a usar confirmaciones nativas del navegador (`confirm(...)`) o modales ad-hoc con booleanos manuales (`displayDeleteModal`).
3. **Acoplamiento de Diálogos en Plantillas:** Las plantillas de listados alojan directamente el marcado completo de los modales (`<p-dialog>`), formularios reactivos extensos y estados booleanos (`displayModal = false`, `isEditing = false`), sobrecargando los archivos HTML y dificultando la reutilización de dichos formularios desde otros puntos del sistema (dashboards, wizards o accesos rápidos).

---

## 2. Solución Propuesta

Implementar una capa transversal de **Servicios UI en `@core`** que desacople la presentación visual de la lógica de invocación:

1. **`NotificationService` (`@core`):**
   - Wrapper tipado sobre `MessageService` de PrimeNG con soporte automático para internacionalización (`ngx-translate`).
   - Métodos declarativos de alto nivel: `success(detailKey, summaryKey?)`, `error(...)`, `warn(...)`, `info(...)`.
   - Uso de un único contenedor `<p-toast position="top-right" [life]="4000" />` en la raíz de la aplicación (`spt-app/app.html`).

2. **`ConfirmDialogService` (`@core`):**
   - Wrapper tipado sobre `ConfirmationService` de PrimeNG con defaults estandarizados según el Athletic Luxury Design System.
   - Métodos preconfigurados para acciones críticas: `confirmDelete({ message, onAccept })`, `confirmAction({ header, message, icon, onAccept, onReject })`.
   - Contenedor único `<p-confirmdialog />` alojado en `spt-app/app.html`.

3. **Arquitectura para Diálogos Dinámicos (`DialogService` / DynamicDialog):**
   - Estandarización de `DialogService` para abrir modales dinámicos (`dialogService.open(Component, config)`), permitiendo extraer los formularios de creación/edición a componentes independientes y dejando los listados limpios de marcado modal.

4. **Refactorización Progresiva en `spt-admin`:**
   - Migración de `facilities-list`, `pricing-list` y `facility-blocks` para consumir `NotificationService` y `ConfirmDialogService`, eliminando instancias locales de `MessageService` y confirmaciones nativas.

---

## 3. Criterios de Aceptación

- [x] **CA-01:** Existe `NotificationService` en `projects/spt-app/src/app/core/services/notification.service.ts` exportado desde `@core`, con métodos `success`, `error`, `warn` e `info` que integran `ngx-translate`.
- [x] **CA-02:** Existe `ConfirmDialogService` en `projects/spt-app/src/app/core/services/confirm-dialog.service.ts` exportado desde `@core`, con métodos tipados para diálogos de confirmación y eliminación.
- [x] **CA-03:** El Shell host (`spt-app/app.html`) contiene los contenedores únicos `<p-toast>` y `<p-confirmdialog>` configurados con estilos globales del Design System.
- [x] **CA-04:** Se eliminan las etiquetas duplicadas `<p-toast>` y los `providers: [MessageService]` locales de los componentes de `spt-admin` (`facilities-list`, `pricing-list`, `facility-blocks`).
- [x] **CA-05:** La confirmación de borrado en `facilities-list` utiliza `ConfirmDialogService` con modal estilizado de PrimeNG en lugar de `confirm(...)` nativo del navegador.
- [x] **CA-06:** La suite completa de pruebas unitarias (`spt-admin` y `spt-app`) pasa al 100% sin regresiones funcionales ni errores de inyección de dependencias.

---

## 4. Impacto Estimado

- **Backend:** Nulo (0% impacto).
- **Frontend:** Refactorización limpia en `@core` y microfrontend `spt-admin`.
- **Base de datos:** Nulo (0% impacto).
- **Riesgo:** 🟢 Bajo (Mejora no disruptiva de arquitectura UI).

---

## 5. Dependencias

- Ninguna dependencia bloqueante. Utiliza dependencias ya instaladas (`primeng/api`, `primeng/toast`, `primeng/confirmdialog`, `@ngx-translate/core`).
