# Tareas: Git Hook Pre-push con Husky y Cobertura Diferencial (`husky-pre-push`)

## Fase 1: Instalación y Configuración de Husky
- [x] 1.1 Instalar `husky` en devDependencies del proyecto raíz
- [x] 1.2 Inicializar estructura `.husky/` y agregar script `prepare: "husky"` en `package.json`

## Fase 2: Script de Cobertura para Código Nuevo
- [x] 2.1 Crear script `scripts/check-coverage-diff.js`
- [x] 2.2 Configurar umbral del 80% para archivos `.ts` modificados/añadidos
- [x] 2.3 Añadir comando npm `"test:coverage:diff": "node scripts/check-coverage-diff.js"`

## Fase 3: Creación del Hook Pre-push y Validación
- [x] 3.1 Crear archivo executable `.husky/pre-push`
- [x] 3.2 Configurar ejecuciones secuenciales (`npm run lint`, `npm run spec:check`, `npm run test:coverage:diff`)
- [x] 3.3 Validar funcionamiento del hook simulando ejecución
