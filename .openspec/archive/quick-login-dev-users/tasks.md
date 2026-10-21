# Tareas: Acceso Rápido con Usuarios de Prueba en Login Local (`quick-login-dev-users`)

## Fase 1: Internacionalización (i18n)
- [x] 1.1 Registrar claves de traducción para usuarios demo en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`

## Fase 2: Componente de Login (`spt-users`)
- [x] 2.1 Definir lista `quickLoginUsers` e indicador `isLocalEnvironment` en `LoginComponent`
- [x] 2.2 Implementar método `fillAndLogin(user)` para autocompletar y autenticar
- [x] 2.3 Añadir la sección visual `@if (isLocalEnvironment)` en `login.component.html` usando directivas PrimeNG (`pButton`, `pTag`)
- [x] 2.4 Estilizar el panel en `login.component.scss` con tokens del sistema de diseño

## Fase 3: Pruebas y Validación
- [x] 3.1 Actualizar pruebas unitarias en `login.component.spec.ts`
- [x] 3.2 Verificar suites completas de frontend (`npm run test:frontend`)
- [x] 3.3 Validar que el pre-push hook y linter se ejecuten limpiamente
- [x] 3.4 Sincronizar CodeGraph con `npm run codegraph:sync`
