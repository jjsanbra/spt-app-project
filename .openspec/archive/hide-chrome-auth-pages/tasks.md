# Tasks: hide-chrome-auth-pages

**Fecha:** 2026-10-22  
**Estado:** ✅ Completado  

---

## Fase 1: Detección Reactiva de Vistas de Acceso en Shell
- [x] **TASK-01**: Modificar [app.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/app/app.ts):
  - Inyectar o suscribir `Router` a `NavigationEnd` manteniendo actualizada una señal `currentUrl`.
  - Crear la señal computada `isAuthPage` para identificar `/login` y `/register`.
- [x] **TASK-02**: Actualizar [app.html](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/app/app.html):
  - Ocultar condicionalmente `.sidebar-backdrop`, `aside.app-sidebar` y `header.app-topbar` cuando `isAuthPage()` sea verdadero.
  - Añadir botón flotante para el toggle de tema cuando `isAuthPage()` sea verdadero.
  - Aplicar clase `[class.auth-layout]="isAuthPage()"`.

## Fase 2: Ajuste de Estilos de Layout y Theme Toggle Flotante
- [x] **TASK-03**: En [app.scss](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/app/app.scss):
  - Añadir reglas para `.auth-layout` (`display: block`, 100% width, min-height 100vh).
  - Añadir reglas para `.auth-theme-floating` usando tokens de diseño y mixins responsivos.

## Fase 3: Pruebas Unitarias y Validación
- [x] **TASK-04**: Actualizar o añadir tests en [app.spec.ts](file:///Users/jjsanquisb/Labs/spt-app-project/apps/frontend/projects/spt-app/src/app/app.spec.ts) para verificar que `isAuthPage` reacciona adecuadamente ante los cambios de ruta.
- [x] **TASK-05**: Ejecutar `npm test` para asegurar que el 100% de las pruebas continúan pasando.
- [x] **TASK-06**: Ejecutar `npm run build:all` y verificar compilación limpia.
- [x] **TASK-07**: Validar OpenSpec con `node scripts/validate-specs.js`.

