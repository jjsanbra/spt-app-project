# Especificación Funcional: refactor-primeng-preset-and-clean-overrides

## Propósito
Estandarizar la configuración visual de componentes PrimeNG a través del sistema oficial de diseño basado en temas (`SPTPreset`), eliminando las sobreescrituras con `!important` y garantizando una arquitectura de estilos limpia y mantenible.

## Reglas de Negocio y Diseño
1. **Regla de Tokens Centrales:** Todo estilo compartido de componentes PrimeNG (`Button`, `Card`, `Avatar`, etc.) debe configurarse a través de `SPTPreset` o variables `--p-*` sin utilizar `!important`.
2. **Regla de Fluidez en Formularios:** Los elementos de formulario y botones de ancho completo deben emplear la propiedad nativa `[fluid]="true"` provista por PrimeNG o clases de layout flex sin sobreescribir `.p-button` con `!important`.
3. **Regla de Encapsulamiento:** Las vistas locales de microfrontends no deben emplear `:host ::ng-deep` para alterar propiedades fundamentales que ya cubre la librería.
