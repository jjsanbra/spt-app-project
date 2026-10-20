# 🏟️ SPT App Project

**SaaS Multi-tenant para gestión de reservas de centros deportivos**

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | NestJS + TypeScript + Prisma ORM |
| **Frontend** | Angular (Standalone Components, Signals) |
| **UI** | PrimeNG + TailwindCSS |
| **Base de datos** | PostgreSQL 16 |
| **Colas** | Redis + BullMQ |
| **Microfrontends** | @angular-architects/native-federation |
| **Testing** | Jest + Playwright |
| **Generación API** | Orval (desde OpenAPI) |
| **Despliegue** | Render.com |

---

## Estructura del Monorepo

```
spt-app-project/
├── apps/
│   ├── backend/          # NestJS API (puerto 3000)
│   └── frontend/         # Angular Workspace
│       └── projects/
│           ├── spt-app/    # Shell Host (4200)
│           ├── spt-admin/  # Remote Admin (4201)
│           ├── spt-portal/ # Remote Portal (4202)
│           └── spt-users/  # Remote Users (4203)
├── libs/
│   └── core/             # Tipos e interfaces compartidas
├── scripts/              # Scripts OpenSpec
├── .openspec/            # Especificaciones de evolutivos
├── docker-compose.yml    # PostgreSQL + Redis (desarrollo local)
├── render.yaml           # Infraestructura en Render (producción)
└── .env.example          # Variables de entorno de referencia
```

---

## Arranque en Desarrollo

### Requisitos previos
- Node.js >= 22
- Docker Desktop

### 1. Clonar y configurar entorno

```bash
git clone https://github.com/jjsanbra/spt-app-project.git
cd spt-app-project
cp .env.example .env
# Edita .env con tus valores si es necesario
```

### 2. Levantar base de datos y Redis

```bash
docker-compose up -d
# PostgreSQL disponible en localhost:5432
# Redis disponible en localhost:6379
# Adminer (UI BD) en http://localhost:8080
```

### 3. Instalar dependencias y migrar BD

```bash
npm install
cd apps/backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Arrancar todos los servicios

```bash
# Desde la raíz del proyecto:
npm run dev

# O por separado:
npm run dev:backend   # API en http://localhost:3000
npm run dev:shell     # Shell en http://localhost:4200
npm run dev:admin     # Admin en http://localhost:4201
npm run dev:portal    # Portal en http://localhost:4202
npm run dev:users     # Users en http://localhost:4203
```

### URLs de desarrollo

| Servicio | URL |
|---------|-----|
| API Backend | http://localhost:3000/api |
| API Docs (Swagger) | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/api/health |
| Shell (app principal) | http://localhost:4200 |
| Admin Panel | http://localhost:4201 |
| Portal de Reservas | http://localhost:4202 |
| Usuarios / Auth | http://localhost:4203 |
| Adminer (BD UI) | http://localhost:8080 |

---

## Flujo OpenSpec (Spec-Driven Development)

Todo evolutivo sigue este flujo antes de escribir código:

```bash
# 1. Crear andamiaje del cambio
node scripts/spec-new-change.js <nombre-del-cambio>

# 2. Redactar proposal.md y design.md
# 3. Revisión humana
# 4. Implementar siguiendo tasks.md

# 5. Al completar:
node scripts/spec-archive.js <nombre-del-cambio>
```

---

## Reglas Críticas de Desarrollo

- 🚫 **NUNCA** hacer `git commit` o `git push` automáticos
- 🚫 **NUNCA** duplicar interfaces — usar siempre los modelos generados por Orval desde `@core`
- 🚫 **NUNCA** usar `<button>` nativos — siempre `pButton` de PrimeNG
- 🚫 **NUNCA** hardcodear colores o tamaños — usar tokens de `_variables.scss`
- 🚫 **NUNCA** usar `@media` manuales — usar mixins de `_responsive.scss`
- 🚫 **NUNCA** textos hardcodeados en HTML/TS — usar `ngx-translate`
- ⚠️ Evaluar riesgo antes de cualquier migración de BD

---

## Despliegue en Render

El fichero `render.yaml` define toda la infraestructura. Para desplegar:

1. Conecta el repo en [render.com](https://render.com)
2. Render detecta automáticamente el `render.yaml`
3. Los remotes se despliegan antes que el shell host
4. Actualiza las variables `MFE_*` tras el primer despliegue

---

*Ver [starter.md](./starter.md) para el contexto completo del proyecto y las directrices de arquitectura.*
