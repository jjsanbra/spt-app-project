# Spec: primeng-components-refactor

**Fecha:** 2026-10-22  
**Versión:** 0.1.0  

---

## Descripción Funcional

Este delta de especificación formaliza las pautas de uso y configuración de componentes PrimeNG v18+ en los microfrontends de la aplicación, corrigiendo directivas obsoletas, centralizando las notificaciones y reforzando la accesibilidad en formularios y tablas.

## Reglas de Negocio

1. **RN-01 (Notificaciones Centralizadas):** Ninguna vista o componente de un microfrontend puede declarar instancias de `<p-toast>` ni proveer `MessageService`. Todos los mensajes de éxito, error, advertencia o información deben emitirse a través del servicio central `NotificationService` de `@core`.
2. **RN-02 (Sintaxis Canónica PrimeNG v18):**
   - Las tablas con alternancia de filas deben utilizar el input booleano `[stripedRows]="true"`. Queda prohibido el uso de `styleClass="p-datatable-striped"`.
   - Los componentes de formulario que deban ocupar el 100% del ancho de su contenedor deben emplear la propiedad nativa `[fluid]="true"` o la clase estándar `class="w-full"`. Queda prohibido el uso de la propiedad `styleClass` en componentes donde no esté declarada en la API oficial.
3. **RN-03 (Accesibilidad y Etiquetas en Formularios):** Todos los componentes encapsulados de PrimeNG (`p-select`, `p-inputnumber`, `p-checkbox`) deben recibir `inputId` coincidente con el atributo `for` de su respectivo `<label>`.
4. **RN-04 (Feedback Visual de Validación):** Los campos reactivos con error de validación deben vincular `[invalid]="form.get('control')?.invalid && form.get('control')?.touched"` para reflejar visualmente el token semántico de error.

## Casos de Uso

### CU-01: Notificación al Iniciar Sesión en `spt-users`
- **Actor:** Usuario autenticándose en la plataforma.
- **Precondición:** El usuario introduce credenciales erróneas o válidas en el formulario de login.
- **Flujo principal:**
  1. El componente `LoginComponent` procesa la petición de autenticación.
  2. Si ocurre un fallo, invoca `this.notify.error('AUTH.LOGIN_ERROR')` a través de `NotificationService`.
  3. `NotificationService` traduce la clave con `ngx-translate` y la despacha al `MessageService` global del Shell host.
  4. El componente `<p-toast>` del Shell host renderiza la notificación en la esquina superior derecha sin depender de ningún toast local.
- **Postcondición:** El usuario recibe el mensaje de error de forma accesible y unificada.

### CU-02: Visualización de Tablas de Gestión en `spt-admin`
- **Actor:** Administrador del club deportivo.
- **Precondición:** El usuario accede a la lista de instalaciones o socios.
- **Flujo principal:**
  1. La tabla `p-table` se renderiza con `[stripedRows]="true"`.
  2. El tema Aura / Stitch aplica los estilos de contraste de filas alternas utilizando los tokens de superficie (`--p-datatable-row-striped-background`).
- **Postcondición:** La tabla se muestra con legibilidad optimizada y sin advertencias en consola por atributos no reconocidos.
