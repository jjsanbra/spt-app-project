#!/usr/bin/env node
/**
 * spec-new-change.js
 * Genera el andamiaje OpenSpec para un nuevo evolutivo.
 * Uso: node scripts/spec-new-change.js <nombre-del-cambio>
 * Ejemplo: node scripts/spec-new-change.js domain-modeling
 */

'use strict';

const fs = require('fs');
const path = require('path');

const changeName = process.argv[2];

if (!changeName) {
  console.error('❌ Error: Debes proporcionar un nombre para el cambio.');
  console.error('   Uso: node scripts/spec-new-change.js <nombre-del-cambio>');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(changeName)) {
  console.error('❌ Error: El nombre solo puede contener letras minúsculas, números y guiones.');
  process.exit(1);
}

const changeDir = path.join(__dirname, '..', '.openspec', 'changes', changeName);
const specsDir = path.join(changeDir, 'specs');

if (fs.existsSync(changeDir)) {
  console.error(`❌ Error: Ya existe un cambio con el nombre "${changeName}".`);
  process.exit(1);
}

fs.mkdirSync(specsDir, { recursive: true });

const now = new Date().toISOString();
const dateStr = now.split('T')[0];

// ── proposal.md ────────────────────────────────────────────────
fs.writeFileSync(path.join(changeDir, 'proposal.md'), `# Proposal: ${changeName}

**Fecha:** ${dateStr}
**Estado:** 🟡 En Revisión
**Autor:** -

---

## 1. Contexto y Motivación

> Describe el problema o necesidad que motiva este cambio.

## 2. Solución Propuesta

> Describe en alto nivel la solución.

## 3. Criterios de Aceptación

- [ ] CA-01: 
- [ ] CA-02: 
- [ ] CA-03: 

## 4. Impacto Estimado

- **Backend:** 
- **Frontend:** 
- **Base de datos:** 
- **Riesgo:** 🟢 Bajo / 🟡 Medio / 🔴 Alto

## 5. Dependencias

> Lista de cambios o fases que deben estar completadas antes de este evolutivo.

- Ninguna
`);

// ── design.md ──────────────────────────────────────────────────
fs.writeFileSync(path.join(changeDir, 'design.md'), `# Design: ${changeName}

**Fecha:** ${dateStr}
**Estado:** 🟡 Borrador

---

## 1. Diagrama / Arquitectura

\`\`\`mermaid
flowchart TD
    A[Inicio] --> B[Fin]
\`\`\`

## 2. Contratos de API (OpenAPI)

> Define los endpoints afectados en formato OpenAPI / pseudo-spec.

\`\`\`yaml
# Ejemplo:
# POST /api/v1/bookings:
#   summary: Crear reserva
#   requestBody: ...
#   responses: ...
\`\`\`

## 3. Modelos de Datos Afectados

> Describe los cambios en el schema de Prisma.

\`\`\`prisma
// Nuevos modelos o modificaciones
\`\`\`

## 4. Riesgo de Base de Datos

| Riesgo | Mitigación |
|--------|-----------|
| -      | -         |

## 5. Diseño UI (si aplica)

> Describe o incluye wireframes/mockups de las pantallas afectadas.

## 6. Decisiones Técnicas

> Registra aquí las decisiones de diseño tomadas y sus alternativas descartadas.
`);

// ── tasks.md ───────────────────────────────────────────────────
fs.writeFileSync(path.join(changeDir, 'tasks.md'), `# Tasks: ${changeName}

**Fecha:** ${dateStr}
**Estado:** ⏳ Pendiente

---

## Backend

- [ ] BACK-01: 
- [ ] BACK-02: 

## Frontend

- [ ] FRONT-01: 
- [ ] FRONT-02: 

## Testing

- [ ] TEST-01: Tests unitarios
- [ ] TEST-02: Tests de integración
- [ ] TEST-03: Tests E2E (Playwright)

## Documentación

- [ ] DOC-01: Actualizar OpenAPI spec
- [ ] DOC-02: Archivar cambio con spec:archive
`);

// ── specs/change.spec.md ────────────────────────────────────────
fs.writeFileSync(path.join(specsDir, `${changeName}.spec.md`), `# Spec: ${changeName}

**Fecha:** ${dateStr}
**Versión:** 0.1.0

---

## Descripción Funcional

> Delta de especificación funcional para este cambio.

## Reglas de Negocio

1. RN-01: 

## Casos de Uso

### CU-01: [Nombre del caso de uso]

**Actor:** 
**Precondición:** 
**Flujo principal:**
1. 
2. 

**Postcondición:** 
`);

console.log(`\n✅ Andamiaje OpenSpec creado para: "${changeName}"`);
console.log(`\n📁 Directorio: .openspec/changes/${changeName}/`);
console.log('   ├── proposal.md   → Contexto y criterios de aceptación');
console.log('   ├── design.md     → Contratos API, modelos, riesgo BD');
console.log('   ├── tasks.md      → Tareas secuenciales con checkboxes');
console.log(`   └── specs/${changeName}.spec.md → Delta funcional\n`);
console.log('📋 Próximos pasos:');
console.log('   1. Redacta proposal.md y design.md');
console.log('   2. Revisión humana antes de escribir código');
console.log('   3. Implementa siguiendo tasks.md');
console.log(`   4. Al finalizar: node scripts/spec-archive.js ${changeName}\n`);
