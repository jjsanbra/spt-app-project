#!/usr/bin/env node
/**
 * spec-archive.js
 * Archiva un evolutivo OpenSpec completado moviéndolo a .openspec/archive/
 * Uso: node scripts/spec-archive.js <nombre-del-cambio>
 */

'use strict';

const fs = require('fs');
const path = require('path');

const changeName = process.argv[2];

if (!changeName) {
  console.error('❌ Error: Debes proporcionar el nombre del cambio a archivar.');
  console.error('   Uso: node scripts/spec-archive.js <nombre-del-cambio>');
  process.exit(1);
}

const changesDir = path.join(__dirname, '..', '.openspec', 'changes', changeName);
const archiveDir = path.join(__dirname, '..', '.openspec', 'archive');
const archivePath = path.join(archiveDir, changeName);

if (!fs.existsSync(changesDir)) {
  console.error(`❌ Error: No existe el cambio "${changeName}" en .openspec/changes/`);
  process.exit(1);
}

if (fs.existsSync(archivePath)) {
  console.error(`❌ Error: Ya existe un archivo para "${changeName}" en .openspec/archive/`);
  process.exit(1);
}

// Verificar que tasks.md tiene todas las tareas completadas
const tasksPath = path.join(changesDir, 'tasks.md');
if (fs.existsSync(tasksPath)) {
  const tasksContent = fs.readFileSync(tasksPath, 'utf-8');
  const pendingTasks = (tasksContent.match(/- \[ \]/g) || []).length;
  if (pendingTasks > 0) {
    console.warn(`⚠️  Advertencia: Hay ${pendingTasks} tarea(s) sin completar en tasks.md`);
    console.warn('   ¿Estás seguro de que quieres archivar? (Ctrl+C para cancelar)\n');
  }
}

// Añadir timestamp de archivado al proposal.md
const proposalPath = path.join(changesDir, 'proposal.md');
if (fs.existsSync(proposalPath)) {
  let proposalContent = fs.readFileSync(proposalPath, 'utf-8');
  const archivedAt = new Date().toISOString().split('T')[0];
  proposalContent = proposalContent.replace(
    '**Estado:** ✅ Completado',
    `**Estado:** ✅ Completado\n**Archivado:** ${archivedAt}`
  );
  proposalContent = proposalContent.replace(
    '**Estado:** 🟡 En Revisión',
    `**Estado:** ✅ Completado\n**Archivado:** ${archivedAt}`
  );
  fs.writeFileSync(proposalPath, proposalContent);
}

// Mover a archive
fs.mkdirSync(archiveDir, { recursive: true });
fs.renameSync(changesDir, archivePath);

console.log(`\n✅ Cambio "${changeName}" archivado correctamente.`);
console.log(`   📦 Ubicación: .openspec/archive/${changeName}/\n`);
console.log('📋 Antes de hacer commit:');
console.log('   1. git add .openspec/');
console.log('   2. Revisa los cambios con git diff --staged');
console.log('   3. git commit -m "feat: [descripción del cambio]"');
console.log('   ⚠️  NUNCA hagas git push automáticamente — revisión manual obligatoria\n');
