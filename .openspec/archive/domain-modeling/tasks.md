# Tasks: domain-modeling (Fase 1)

**Fecha:** 2026-10-20  
**Estado:** 🟡 Pendiente de aprobación  

---

## Tareas de Implementación

- [x] **1. Revisión y Aprobación de Especificación**
  - [x] 1.1 Revisión por parte del usuario de `proposal.md` y `design.md`
  - [x] 1.2 Validación del modelo relacional y reglas de negocio multi-deporte

- [x] **2. Actualización del Schema de Prisma**
  - [x] 2.1 Escribir los 10 modelos y enums en `apps/backend/prisma/schema.prisma`
  - [x] 2.2 Ejecutar `npx prisma validate` y `npx prisma format`
  - [x] 2.3 Ejecutar `npx prisma generate` para actualizar los tipos TypeScript en `@prisma/client`

- [x] **3. Migración de Base de Datos**
  - [x] 3.1 Asegurar conexión a PostgreSQL (contenedor `spt_postgres` en puerto 5433 en OrbStack)
  - [x] 3.2 Crear y aplicar la migración inicial: `npx prisma migrate dev --name init_domain_models`

- [x] **4. Seed de Datos Inicial para Desarrollo**
  - [x] 4.1 Crear `apps/backend/prisma/seed.ts` con:
    - 1 Superadmin global (`superadmin@spt-app.local`)
    - 1 Club demo ("Club Deportivo Central Pádel & Tenis")
    - 1 Administrador de club y 2 usuarios jugadores (Socio e Invitado)
    - 4 Instalaciones (Pádel Indoor, Pádel Cristal, Tenis Tierra Batida, Campo Fútbol 7)
    - Reglas de precios base (socios y no socios, hora punta y valle)
  - [x] 4.2 Ejecutar `npm run prisma:seed` y verificar datos creados

- [x] **5. Verificación y Cierre**
  - [x] 5.1 Verificar compilación del backend (`npm run build:backend`)
  - [x] 5.2 Comprobar arranque y endpoint de salud `/api/v1/health` (database: "up")
