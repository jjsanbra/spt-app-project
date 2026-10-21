# Especificación Funcional: Hook Pre-Push y Cobertura Diferencial (`husky-pre-push`)

## Requerimientos

### R-HOOK-01: Intercepción de Git Push
- Al ejecutar `git push`, el sistema debe invocar automáticamente el hook `.husky/pre-push`.
- Si alguno de los pasos de verificación falla, el push debe cancelarse de forma obligatoria y devolver código de salida distinto de cero.

### R-HOOK-02: Calidad Estática y Documental
- El hook debe verificar la ausencia de errores de linter mediante `npm run lint`.
- El hook debe verificar la validez de especificaciones activas y archivadas mediante `npm run spec:check`.

### R-HOOK-03: Cobertura Mínima del 80% en Código Nuevo
- El validador `scripts/check-coverage-diff.js` debe comparar los archivos fuente de NestJS modificados contra la rama base.
- Si un archivo nuevo o modificado que contiene lógica de negocio posee una cobertura de líneas menor al 80%, el comando debe fallar reportando el porcentaje actual y el umbral requerido.
- Si no hay archivos de lógica modificados, debe continuar sin bloquear.
