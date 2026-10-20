# Tareas: Ampliación del Catálogo de Deportes (`expand-sports-catalog`)

## Fase 1: Base de Datos y Backend
- [x] 1.1 Modificar el enum `SportType` en `apps/backend/prisma/schema.prisma` agregando los 13 nuevos deportes
- [x] 1.2 Ejecutar migración de Prisma `npx prisma migrate dev --name expand_sport_types`
- [x] 1.3 Exportar OpenAPI 3.0 actualizado con `npm run swagger:export`
- [x] 1.4 Validar tests unitarios de backend con `npm run test:backend`

## Fase 2: Sincronización OpenAPI y Tipos
- [x] 2.1 Regenerar clientes y tipos con Orval (`npm run api:generate`)
- [x] 2.2 Verificar actualización de enums en `@core`

## Fase 3: Frontend y Traducciones
- [x] 3.1 Añadir las traducciones completas bajo `SPORTS` en `es.json` y replicar a directorios públicos
- [x] 3.2 Actualizar las opciones en los selectores de deportes de `spt-admin` y `spt-portal` para consumir las nuevas claves
- [x] 3.3 Validar tests de frontend con `npm run test:frontend`

## Fase 4: Calidad y Cierre
- [x] 4.1 Ejecutar suite completa de tests y sincronizar CodeGraph (`npm run codegraph:sync`)
