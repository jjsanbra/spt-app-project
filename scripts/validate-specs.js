#!/usr/bin/env node

/**
 * Script de validación de especificaciones OpenSpec
 * Verifica la integridad de los cambios activos y archivados.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OPENSPEC_DIR = path.join(ROOT_DIR, '.openspec');
const CHANGES_DIR = path.join(OPENSPEC_DIR, 'changes');
const ARCHIVE_DIR = path.join(OPENSPEC_DIR, 'archive');

console.log('🔍 Validando integridad de especificaciones OpenSpec...');

let hasErrors = false;

if (!fs.existsSync(OPENSPEC_DIR)) {
  console.error('❌ Error: El directorio .openspec no existe.');
  process.exit(1);
}

const REQUIRED_FILES = ['proposal.md', 'design.md', 'tasks.md'];

// 1. Validar cambios activos
if (fs.existsSync(CHANGES_DIR)) {
  const activeChanges = fs
    .readdirSync(CHANGES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  if (activeChanges.length === 0) {
    console.log('ℹ️  No hay cambios activos en .openspec/changes/ (todos archivados o limpio).');
  } else {
    console.log(`📋 Verificando ${activeChanges.length} cambio(s) activo(s)...`);

    for (const change of activeChanges) {
      const changePath = path.join(CHANGES_DIR, change);
      console.log(`  👉 Cambio activo: "${change}"`);

      // Verificar archivos requeridos
      for (const reqFile of REQUIRED_FILES) {
        const filePath = path.join(changePath, reqFile);
        if (!fs.existsSync(filePath)) {
          console.error(`     ❌ Falta el archivo requerido: ${reqFile}`);
          hasErrors = true;
        } else {
          const stats = fs.statSync(filePath);
          if (stats.size === 0) {
            console.error(`     ❌ El archivo ${reqFile} está vacío.`);
            hasErrors = true;
          }
        }
      }

      // Verificar directorio specs
      const specsDir = path.join(changePath, 'specs');
      if (!fs.existsSync(specsDir)) {
        console.error(`     ❌ Falta el directorio "specs/" en ${change}`);
        hasErrors = true;
      } else {
        const specFiles = fs
          .readdirSync(specsDir)
          .filter((f) => f.endsWith('.spec.md'));
        if (specFiles.length === 0) {
          console.error(`     ❌ No se encontraron archivos .spec.md dentro de specs/`);
          hasErrors = true;
        }
      }
    }
  }
}

// 2. Validar cambios archivados
if (fs.existsSync(ARCHIVE_DIR)) {
  const archivedChanges = fs
    .readdirSync(ARCHIVE_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(`📦 Verificando catálogo archivado (${archivedChanges.length} especificaciones)...`);

  for (const archive of archivedChanges) {
    const archivePath = path.join(ARCHIVE_DIR, archive);
    for (const reqFile of REQUIRED_FILES) {
      const filePath = path.join(archivePath, reqFile);
      if (!fs.existsSync(filePath)) {
        console.warn(`     ⚠️  [Aviso] Cambio archivado "${archive}" carece de ${reqFile}`);
      }
    }
  }
}

if (hasErrors) {
  console.error('\n❌ La validación de OpenSpec falló con errores. Corrige las especificaciones.');
  process.exit(1);
} else {
  console.log('\n✅ Todas las especificaciones OpenSpec son íntegras y válidas.\n');
  process.exit(0);
}
