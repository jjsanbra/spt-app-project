# Propuesta: Selector de Acceso Rápido con Usuarios de Prueba en Login Local

## Contexto
Durante el desarrollo, pruebas manuales y validación de flujos multi-rol (Superadmin, Administrador de Club, Socio, Invitado), rellenar repetidamente las credenciales en el formulario de inicio de sesión ralentiza el ciclo de desarrollo y la experiencia de testing local.

## Problema de Negocio
1. Los desarrolladores y evaluadores deben recordar o consultar continuamente las contraseñas del `seed.ts` para alternar entre roles (superadmin, admin de club, socio e invitado).
2. Es crítico que esta funcionalidad de conveniencia **NUNCA** sea visible ni accesible en entornos de producción (despliegue en Render o dominios reales), protegiendo la seguridad del sistema SaaS.

## Solución Propuesta
1. **Detección Estricta de Entorno Local:**
   - Habilitar el panel de acceso rápido únicamente si `isDevMode()` es verdadero o si el hostname es `localhost` / `127.0.0.1`.
2. **Panel de Usuarios de Prueba en la Vista de Login (`spt-users`):**
   - Presentar una sección visualmente integrada con el Design System que muestre 4 perfiles predefinidos basados en los datos del `seed.ts`:
     - **Superadmin:** `superadmin@spt-app.local`
     - **Admin Club:** `admin@centralpadel.local`
     - **Socio:** `socio@spt-app.local`
     - **Invitado:** `invitado@spt-app.local`
   - Al pulsar sobre cualquiera de ellos, rellenar instantáneamente el formulario de login e iniciar sesión de forma automática.
3. **Reglas de UI & i18n:**
   - Uso obligatorio de directiva `pButton`, `pTag`/`pBadge` de PrimeNG.
   - Textos 100% internacionalizados en `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
   - Variables semánticas del sistema de diseño (sin colores ni tamaños hardcodeados).

## Criterios de Aceptación (CA)
- **CA-01:** El panel de acceso rápido solo se renderiza si el entorno es estrictamente local (`localhost`/`127.0.0.1` o `isDevMode()`). En producción permanece completamente oculto.
- **CA-02:** El panel contiene los 4 roles principales (Superadmin, Admin, Socio, Invitado) con distintivos visuales claros.
- **CA-03:** Al hacer clic en un usuario demo, se autocompletan las credenciales en el formulario y se dispara el login correspondiente.
- **CA-04:** Todos los textos emplean `ngx-translate` y no hay literales hardcodeados.
- **CA-05:** Cero riesgo en base de datos (0 modificaciones a esquemas de Prisma o migraciones).
