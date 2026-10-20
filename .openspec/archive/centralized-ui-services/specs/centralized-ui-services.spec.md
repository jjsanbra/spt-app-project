# Spec: Centralized UI Services (Toasts y Diálogos de Confirmación)

**Evolutivo:** `centralized-ui-services`  
**Fecha:** 2026-10-20  
**Área:** Frontend Architecture / UI Services  

---

## 1. Notificaciones Toasts Centralizadas (`NotificationService`)

### Reglas de Negocio
- **RN-TOAST-01 (Singleton Global):** Todas las notificaciones del sistema deben emitirse a través del contenedor raíz del Shell (`spt-app`). Ningún componente o microfrontend debe instanciar un `<p-toast>` local en su plantilla.
- **RN-TOAST-02 (Internacionalización Obligatoria):** El servicio debe aceptar claves de traducción (`i18n`) y resolverlas mediante `ngx-translate`. Si no se especifica título (`summaryKey`), se asignará el título estándar correspondiente según la severidad (`COMMON.SUCCESS`, `COMMON.ERROR`, `COMMON.WARN`, `COMMON.INFO`).
- **RN-TOAST-03 (Duración):** Los mensajes de éxito, información y advertencia tendrán un tiempo de vida por defecto de 4000ms. Los mensajes de error permanecerán durante 6000ms o requerirán cierre explícito según configuración.

### Casos de Uso
1. **Éxito en creación/edición de entidad:**
   - La vista invoca `this.notify.success('ADMIN.FACILITIES.CREATE_SUCCESS')`.
   - Se muestra un toast verde en la esquina superior derecha con el icono de éxito y texto en español.
2. **Error de red o validación backend:**
   - La vista invoca `this.notify.error('ADMIN.FACILITIES.ERROR_LOAD')`.
   - Se muestra un toast rojo en la esquina superior derecha.

---

## 2. Diálogos de Confirmación Centralizados (`ConfirmDialogService`)

### Reglas de Negocio
- **RN-CONFIRM-01 (Prohibición de Diálogos Nativos):** Queda estrictamente prohibido el uso de `window.confirm(...)` o `window.alert(...)` en cualquier vista o microfrontend.
- **RN-CONFIRM-02 (Contenedor Raíz Único):** La confirmación se renderiza en el `<p-confirmdialog />` ubicado en la raíz de la aplicación.
- **RN-CONFIRM-03 (Acciones Destructivas):** Para acciones de borrado o deshabilitación permanente, el botón de aceptación debe mostrar estilo de peligro (`severity="danger"`), icono de advertencia (`pi pi-exclamation-triangle`) y requerir confirmación explícita del usuario.
- **RN-CONFIRM-04 (Callbacks Seguros):** El callback `onAccept` puede ser síncrono o devolver una promesa; el diálogo se cierra automáticamente tras la confirmación.

### Casos de Uso
1. **Eliminación de Pista Deportiva:**
   - Usuario hace clic en el botón de eliminar de una pista activa.
   - Se abre el diálogo modal estilizado con el mensaje de confirmación traducido.
   - Si el usuario hace clic en "Cancelar" o pulsa `ESC`, no se ejecuta ninguna petición y el diálogo se cierra.
   - Si el usuario hace clic en "Eliminar", se ejecuta `deleteFacility(id)` y se muestra el toast de éxito correspondiente.
