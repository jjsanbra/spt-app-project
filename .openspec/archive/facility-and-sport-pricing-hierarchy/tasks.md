# Tareas de Implementación: Jerarquía de Tarifas por Deporte y Pista

**Fecha:** 2026-10-23
**Estado:** ✅ Completado

---

## Fase 1: Backend (DTOs y Enriquecimiento de Reglas de Precio)
- [x] 1.1 Actualizar `PricingRuleResponseDto` para incluir opcionalmente `facilityName` de la pista vinculada.
- [x] 1.2 En `PricingService.findAll`, incluir relación `facility: { select: { name: true } }` y mapear `facilityName`.
- [x] 1.3 Asegurar que `PricingService.create` y `update` manejen consistentemente `facilityId` y `sportType`.
- [x] 1.4 Reforzar en `BookingsService` la resolución jerárquica canónica (Pista > Deporte > Global) garantizando prioridad exacta.

## Fase 2: Sincronización de Modelos y Contratos (@core)
- [x] 2.1 Ejecutar `npm run api:generate` para sincronizar los contratos de Orval y exportar los tipos generados en `@core`.

## Fase 3: Frontend - Módulo de Tarifas (`pricing-list`)
- [x] 3.1 Cargar listado de pistas activas del club en `pricing-list.component.ts`.
- [x] 3.2 Añadir selector de Ámbito (`GLOBAL`, `SPORT`, `FACILITY`) en el modal de tarifas.
- [x] 3.3 Añadir selectores dinámicos correspondientes (`p-select` para deporte o pista según el ámbito elegido).
- [x] 3.4 Mostrar en la tabla de tarifas la columna `Aplica a` con tags de PrimeNG (`Global`, Deporte con icono, Pista con nombre).
- [x] 3.5 Añadir claves de traducción en `es.json` (`ADMIN.PRICING.SCOPE_*`).

## Fase 4: Frontend - Módulo de Pistas (`facilities-list`)
- [x] 4.1 Cargar reglas de tarifas activas del club en `facilities-list.component.ts`.
- [x] 4.2 Añadir columna en la tabla de pistas mostrando la tarifa base resuelta (Precio Socio / Invitado) y badge de origen.
- [x] 4.3 En el modal de creación/edición de pista, añadir sección para configurar precio base específico para la pista o heredar automáticamente.
- [x] 4.4 Al guardar pista con precio específico, crear o actualizar la `PricingRule` vinculada a `facilityId`.

## Fase 5: Pruebas Unitarias y Cobertura (>= 80%)
- [x] 5.1 Pruebas unitarias de `PricingService` y `BookingsService` con la resolución jerárquica de precios.
- [x] 5.2 Pruebas unitarias de `pricing-list.component.spec.ts` para el selector de ámbito y asignación a pistas/deportes.
- [x] 5.3 Pruebas unitarias de `facilities-list.component.spec.ts` para la visualización y configuración de tarifas.
- [x] 5.4 Ejecutar `npm test` y verificar cobertura integral.

## Fase 6: Validación OpenSpec y Build
- [x] 6.1 Validar integridad de especificaciones con `npm run spec:check`.
- [x] 6.2 Validar build de producción con `npm run build:all`.
