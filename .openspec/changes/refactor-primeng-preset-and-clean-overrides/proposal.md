# Propuesta: refactor-primeng-preset-and-clean-overrides

## Contexto
En evolutivos y maquetaciones previas de la aplicación frontend se recurrió reiteradamente al uso de `!important` y `:host ::ng-deep` para forzar estilos visuales sobre componentes de PrimeNG (`p-button`, `p-card`, `p-avatar`, `p-divider`, `p-tag`, etc.) en hojas de estilo globales (`_buttons.scss`) y en vistas locales (`profile.component.scss`, `login.component.scss`).

Este patrón genera una guerra de especificidad en CSS: cuando un componente de la librería intenta usar variantes nativas (`severity`, `size`, `[fluid]`) o cuando se retiran los `!important`, los estilos se rompen o quedan desalineados porque el tema oficial (`SPTPreset` basado en `@primeng/themes/aura`) no tenía configurados los tokens semánticos correspondientes.

## Problema de Negocio / Técnico
- Los estilos del Design System están desacoplados de la librería PrimeNG 22, forzando más de 30 declaraciones con `!important` en `_buttons.scss` y bloques completos de `:host ::ng-deep` en componentes de usuario.
- Dificulta el mantenimiento y la extensibilidad: cualquier nueva pantalla requiere replicar `!important` y hacks para ajustarse a la estética Stitch.
- Va en contra directa de las directivas de arquitectura del proyecto (`AGENTS.md`), que exige priorizar los componentes oficiales de PrimeNG y respetar el encapsulamiento.

## Solución Propuesta
1. **Enriquecer `SPTPreset` (`spt.preset.ts`):** Declarar formalmente en el preset de PrimeNG los tokens de componentes (`card`, `button`, `avatar`, `tag`) para que la librería los aplique nativamente con cero `!important`.
2. **Sanear `_buttons.scss`:** Retirar todas las directivas `!important`, delegando el coloreado de variantes y tamaños en los tokens semánticos de PrimeNG.
3. **Limpiar `profile.component.scss` y `login.component.scss`:**
   - Eliminar los bloques `:host ::ng-deep` que forzaban propiedades con `!important`.
   - Utilizar directivas oficiales de PrimeNG (`[fluid]="true"`, `severity`, `size`, `shape="circle"`).
   - Estructurar clases de apoyo puras sin colisionar con el CSS interno de PrimeNG.

## Criterios de Aceptación (CA)
- **CA-01:** `spt.preset.ts` define los tokens oficiales de `card`, `button` y `avatar` acordes a la identidad visual Stitch.
- **CA-02:** `_buttons.scss` no contiene declaraciones con `!important` en sus variantes primarias, secundarias ni de tamaño.
- **CA-03:** `login.component` muestra el botón "Entrar" a ancho completo utilizando la propiedad oficial `[fluid]="true"` o flex sin `!important`.
- **CA-04:** `profile.component` renderiza el avatar, tarjetas y datos personales con la estética Stitch sin requerir `:host ::ng-deep` invasivo ni `!important`.
- **CA-05:** Todas las pruebas unitarias de los 4 microfrontends (`spt-app`, `spt-admin`, `spt-portal`, `spt-users`) pasan al 100%.
