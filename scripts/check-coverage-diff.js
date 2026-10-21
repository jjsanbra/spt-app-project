#!/usr/bin/env node

/**
 * Script de Verificación de Cobertura en Código Nuevo / Modificado (Full-Stack)
 * Exige un mínimo del 80% de cobertura en líneas para cada archivo de lógica modificado
 * tanto en Backend (NestJS / Jest) como en Frontend (Angular / Vitest).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'apps/backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'apps/frontend');
const MIN_COVERAGE_PERCENT = 80;

console.log('🧪 Evaluando cobertura de pruebas en código nuevo/modificado (Full-Stack)...');

// 1. Obtener archivos modificados mediante git diff
function getModifiedFiles() {
  try {
    let diffOutput = execSync('git diff --name-only origin/main...HEAD', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    }).trim();

    if (!diffOutput) {
      diffOutput = execSync('git diff --name-only HEAD~1...HEAD', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
      }).trim();
    }

    return diffOutput.split('\n').filter(Boolean);
  } catch (_e) {
    try {
      const statusOutput = execSync('git diff --name-only HEAD', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
      }).trim();
      return statusOutput.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }
}

const modifiedFiles = getModifiedFiles();

// -----------------------------------------------------------------------------------
// 2. BACKEND AUDIT (NestJS + Jest)
// -----------------------------------------------------------------------------------
const BACKEND_EXCLUDED = [
  /\.spec\.ts$/,
  /\.e2e-spec\.ts$/,
  /\.module\.ts$/,
  /\.dto\.ts$/,
  /\.interface\.ts$/,
  /main\.ts$/,
  /seed\.ts$/,
];

const relevantBackendFiles = modifiedFiles.filter((file) => {
  if (!file.startsWith('apps/backend/src/')) return false;
  if (!file.endsWith('.ts')) return false;
  return !BACKEND_EXCLUDED.some((pattern) => pattern.test(file));
});

let backendFailed = false;

if (relevantBackendFiles.length > 0) {
  console.log(`\n📦 [Backend] Archivos de lógica modificados detectados (${relevantBackendFiles.length}):`);
  relevantBackendFiles.forEach((f) => console.log(`   - ${f}`));

  console.log('   ⏳ Ejecutando pruebas unitarias de backend...');
  try {
    execSync('npm test -- --coverage --coverageReporters=json-summary --silent', {
      cwd: BACKEND_DIR,
      stdio: 'ignore',
    });
  } catch {
    console.error('❌ Error: Las pruebas unitarias de backend han fallado.');
    backendFailed = true;
  }

  const backendSummaryPath = path.join(BACKEND_DIR, 'coverage/coverage-summary.json');
  if (fs.existsSync(backendSummaryPath)) {
    const summary = JSON.parse(fs.readFileSync(backendSummaryPath, 'utf-8'));
    console.log('\n📊 [Backend] Reporte de Cobertura:');
    console.log('-----------------------------------------------------------------------------------');
    console.log(`${'Archivo'.padEnd(50)} | ${'Líneas %'.padStart(10)} | ${'Mínimo %'.padStart(10)} | Estado`);
    console.log('-----------------------------------------------------------------------------------');

    for (const relFile of relevantBackendFiles) {
      const absPath = path.resolve(ROOT_DIR, relFile);
      const fileStats = summary[absPath];

      if (!fileStats) {
        console.log(
          `${relFile.slice(17).padEnd(50)} | ${'0.00%'.padStart(10)} | ${`${MIN_COVERAGE_PERCENT}%`.padStart(10)} | ❌ SIN TEST`,
        );
        backendFailed = true;
        continue;
      }

      const linesPct = fileStats.lines ? fileStats.lines.pct : 0;
      const isPassing = linesPct >= MIN_COVERAGE_PERCENT;
      console.log(
        `${relFile.slice(17).padEnd(50)} | ${`${linesPct.toFixed(1)}%`.padStart(10)} | ${`${MIN_COVERAGE_PERCENT}%`.padStart(10)} | ${isPassing ? '✅ OK' : '❌ INSUFICIENTE'}`,
      );

      if (!isPassing) backendFailed = true;
    }
    console.log('-----------------------------------------------------------------------------------\n');
  }
} else {
  console.log('ℹ️  [Backend] No hay archivos de lógica modificados.');
}

// -----------------------------------------------------------------------------------
// 3. FRONTEND AUDIT (Angular + Vitest)
// -----------------------------------------------------------------------------------
const FRONTEND_EXCLUDED = [
  /\.spec\.ts$/,
  /\.config\.ts$/,
  /\.routes\.ts$/,
  /bootstrap\.ts$/,
  /main\.ts$/,
  /\.d\.ts$/,
];

// Agrupar archivos modificados por proyecto de microfrontend
const frontendProjects = ['spt-app', 'spt-admin', 'spt-portal', 'spt-users'];
const modifiedByProject = {};

frontendProjects.forEach((proj) => {
  const prefix = `apps/frontend/projects/${proj}/src/app/`;
  const files = modifiedFiles.filter((file) => {
    if (!file.startsWith(prefix)) return false;
    if (!file.endsWith('.ts')) return false;
    return !FRONTEND_EXCLUDED.some((pattern) => pattern.test(file));
  });
  if (files.length > 0) {
    modifiedByProject[proj] = files;
  }
});

let frontendFailed = false;
const activeFrontendProjects = Object.keys(modifiedByProject);

if (activeFrontendProjects.length > 0) {
  console.log(`\n🎨 [Frontend] Proyectos de microfrontend con código modificado: ${activeFrontendProjects.join(', ')}`);

  for (const proj of activeFrontendProjects) {
    const files = modifiedByProject[proj];
    console.log(`\n   👉 Microfrontend: "${proj}" (${files.length} archivo(s)):`);
    files.forEach((f) => console.log(`      - ${f}`));

    console.log(`   ⏳ Ejecutando pruebas unitarias de ${proj} con cobertura...`);
    try {
      execSync(`npx ng test ${proj} --watch=false --coverage --coverage-reporters=json-summary --silent`, {
        cwd: FRONTEND_DIR,
        stdio: 'ignore',
      });
    } catch {
      console.error(`❌ Error: Las pruebas unitarias de ${proj} han fallado.`);
      frontendFailed = true;
      continue;
    }

    const projSummaryPath = path.join(FRONTEND_DIR, `coverage/${proj}/coverage-summary.json`);
    if (fs.existsSync(projSummaryPath)) {
      const summary = JSON.parse(fs.readFileSync(projSummaryPath, 'utf-8'));
      console.log(`\n📊 [Frontend - ${proj}] Reporte de Cobertura:`);
      console.log('-----------------------------------------------------------------------------------');
      console.log(`${'Archivo'.padEnd(50)} | ${'Líneas %'.padStart(10)} | ${'Mínimo %'.padStart(10)} | Estado`);
      console.log('-----------------------------------------------------------------------------------');

      for (const relFile of files) {
        const absPath = path.resolve(ROOT_DIR, relFile);
        const fileStats = summary[absPath];

        if (!fileStats) {
          const shortName = path.basename(relFile);
          console.log(
            `${shortName.padEnd(50)} | ${'0.00%'.padStart(10)} | ${`${MIN_COVERAGE_PERCENT}%`.padStart(10)} | ❌ SIN TEST`,
          );
          frontendFailed = true;
          continue;
        }

        const linesPct = fileStats.lines ? fileStats.lines.pct : 0;
        const isPassing = linesPct >= MIN_COVERAGE_PERCENT;
        const shortName = path.basename(relFile);
        console.log(
          `${shortName.padEnd(50)} | ${`${linesPct.toFixed(1)}%`.padStart(10)} | ${`${MIN_COVERAGE_PERCENT}%`.padStart(10)} | ${isPassing ? '✅ OK' : '❌ INSUFICIENTE'}`,
        );

        if (!isPassing) frontendFailed = true;
      }
      console.log('-----------------------------------------------------------------------------------');
    }
  }
} else {
  console.log('ℹ️  [Frontend] No hay archivos de componentes modificados.');
}

// -----------------------------------------------------------------------------------
// 4. VEREDICTO FINAL
// -----------------------------------------------------------------------------------
if (backendFailed || frontendFailed) {
  console.error('\n❌ Fallo de validación: El código nuevo o modificado no alcanza el umbral de cobertura (>= 80%).');
  console.error('👉 Añade o amplía las pruebas unitarias correspondientes antes de hacer git push.\n');
  process.exit(1);
} else {
  console.log('\n✅ Cobertura Full-Stack validada con éxito (mínimo 80% en código nuevo/modificado).\n');
  process.exit(0);
}
