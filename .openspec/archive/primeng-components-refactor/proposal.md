# Proposal: primeng-components-refactor

**Fecha:** 2026-10-22  
**Estado:** 🟢 Completado  
**Autor:** Antigravity AI  

---

## 1. Contexto y Motivación

A partir del análisis exhaustivo y las validaciones ejecutadas contra el servidor oficial `@primeng/mcp` (`validate_usage`, `get_component`), se han detectado inconsistencias de sintaxis y desviaciones de las directivas arquitectónicas del proyecto:
1. **Violación de Notificaciones Centralizadas en `spt-users`:** Las vistas de autenticación (`login`, `register`, `profile`) declaran `<p-toast></p-toast>` locales y proveen `MessageService` a nivel de componente, contraviniendo la directiva de [AGENTS.md](file:///Users/jjsanquisb/Labs/spt-app-project/AGENTS.md), donde se establece que las notificaciones deben emitirse exclusivamente mediante `NotificationService` desde `@core` y mostrarse a través del contenedor global del Shell host (`spt-app/app.html`).
2. **Propiedades obsoletas e inexistentes en PrimeNG v18+:** Componentes como `p-table`, `p-select` y `p-inputnumber` usan la propiedad `styleClass="p-datatable-striped"` o `styleClass="w-full"`, la cual no existe en la API moderna de PrimeNG v18 (que estandariza el uso de `[stripedRows]="true"`, `[fluid]="true"` y clases nativas `class="..."`).
3. **Falta de enlace de accesibilidad e indicación reactiva de error:** Los formularios carecen del binding `[invalid]` para activar los tokens semánticos de error del tema Aura, y los `<label for="...">` no están enlazados con el `inputId` de los componentes encapsulados de PrimeNG.
4. **Imports no utilizados:** Presencia de `CardModule` y `FloatLabelModule` importados en componentes standalone sin ser usados en las plantillas.

---

## 2. Solución Propuesta

1. **Centralización de Notificaciones en `spt-users`:**
   - Retirar `<p-toast></p-toast>` y `ToastModule` de `login`, `register` y `profile`.
   - Eliminar `providers: [MessageService]` e inyectar `NotificationService` desde `@core`.
   - Actualizar las suites de test unitarios correspondientes para utilizar mocks de `NotificationService`.
2. **Alineación con la API Oficial de PrimeNG v18 (`@primeng/mcp`):**
   - Sustituir `styleClass="p-datatable-striped"` por `[stripedRows]="true"` en todas las tablas de `spt-admin` y `spt-portal`.
   - Sustituir `styleClass="w-full"` por `[fluid]="true"` o `class="w-full"` en `p-select`, `p-inputnumber` y `p-password`.
3. **Accesibilidad y Validación Visual (`[invalid]` & `inputId`):**
   - Añadir enlace `[invalid]="form.get('campo')?.invalid && form.get('campo')?.touched"` en inputs y selects.
   - Usar `inputId` en `p-select`, `p-inputnumber` y `p-checkbox` sincronizado con el atributo `for` de las etiquetas `<label>`.
4. **Limpieza de Código Muerto:**
   - Eliminar imports innecesarios de `CardModule` y `FloatLabelModule` en los componentes standalone analizados.

---

## 3. Criterios de Aceptación (CA)

- [x] **CA-01:** Eliminación completa de `<p-toast>` y `MessageService` local en `spt-users` (`login`, `register`, `profile`), sustituidos por `NotificationService` de `@core`.
- [x] **CA-02:** Actualización de todas las tablas `p-table` (`spt-admin` y `spt-portal`) para usar la propiedad nativa `[stripedRows]="true"` y eliminación de `styleClass="p-datatable-striped"`.
- [x] **CA-03:** Actualización de componentes de formulario (`p-select`, `p-inputnumber`, `p-password`) para usar `[fluid]="true"` / `class="w-full"` en vez del obsoleto `styleClass="w-full"`.
- [x] **CA-04:** Configuración de `inputId` en controles de formulario para asociar correctamente los `<label for="...">`.
- [x] **CA-05:** Aplicación de `[invalid]` en inputs de formulario para reflejar el estado de error temático de PrimeNG.
- [x] **CA-06:** Limpieza de imports muertos en componentes standalone.
- [x] **CA-07:** Ejecución limpia de tests (`npm test`) y compilación exitosa (`npm run build:all`) sin errores de regresión.

---

## 4. Impacto Estimado

- **Backend:** 0 archivos (Sin impacto).
- **Base de datos:** 0 cambios. Riesgo NULO.
- **Frontend:** Refactorización controlada en componentes de `spt-users`, `spt-admin` y `spt-portal`.
- **Riesgo:** 🟢 Bajo (Mejora de calidad de código, accesibilidad y cumplimiento de arquitectura sin impacto en modelos ni contratos de API).

---

## 5. Dependencias

- Ninguna dependencia previa bloqueante.
