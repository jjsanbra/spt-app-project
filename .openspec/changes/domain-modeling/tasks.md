# Tasks: domain-modeling (Fase 1)

**Fecha:** 2026-10-20  
**Estado:** 🟡 Pendiente de aprobación  

---

## Tareas de Implementación

- [ ] **1. Revisión y Aprobación de Especificación**
  - [ ] 1.1 Revisión por parte del usuario de `proposal.md` y `design.md`
  - [ ] 1.2 Validación del modelo relacional y reglas de negocio multi-deporte

- [ ] **2. Actualización del Schema de Prisma**
  - [ ] 2.1 Escribir los 10 modelos y enums en `apps/backend/prisma/schema.prisma`
  - [ ] 2.2 Ejecutar `npx prisma validate` y `npx prisma format`
  - [ ] 2.3 Ejecutar `npx prisma generate` para actualizar los tipos TypeScript en `@prisma/client`

- [ ] **3. Migración de Base de Datos**
  - [ ] 3.1 Asegurar conexión a PostgreSQL
  - [ ] 3.2 Crear y aplicar la migración inicial: `npx prisma migrate dev --name init_domain_models`

- [ ] **4. Seed de Datos Inicial para Desarrollo**
  - [ ] 4.1 Crear `apps/backend/prisma/seed.ts` con:
    - 1 Superadmin global
    - 1 Club demo ("Club Deportivo Central Pádel & Tenis")
    - 1 Administrador de club y 2 usuarios jugadores
    - 4 Instalaciones (Pádel Indoor, Pádel Cristal, Tenis Tierra Batida, Campo Fútbol 7)
    - Reglas de precios base (socios y no socios, hora punta y valle)
  - [ ] 4.2 Ejecutar `npm run prisma:seed` y verificar datos creados

- [ ] **5. Verificación y Cierre**
  - [ ] 5.1 Verificar compilación del backend (`npm run build:backend`)
  - [ ] 5.2 Archivar el evolutivo con `node scripts/spec-archive.js domain-modeling`
