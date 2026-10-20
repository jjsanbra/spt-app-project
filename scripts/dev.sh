#!/usr/bin/env bash
# ==============================================================================
# SPT App — Script de desarrollo unificado con concurrently
# Levanta la API NestJS y los 4 Microfrontends Angular en paralelo
# ==============================================================================

set -e

# Asegurar que estamos en la raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=================================================="
echo "🚀 Iniciando SPT App en modo desarrollo..."
echo "=================================================="
echo "  • Backend API:      http://localhost:3000/api"
echo "  • Shell Host:       http://localhost:4200"
echo "  • Admin Remote:     http://localhost:4201"
echo "  • Portal Remote:    http://localhost:4202"
echo "  • Users Remote:     http://localhost:4203"
echo "=================================================="

npm run dev
