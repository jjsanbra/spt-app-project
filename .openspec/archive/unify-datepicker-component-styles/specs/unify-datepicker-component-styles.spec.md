# Especificación: Unificación de Componentes y Estilos DatePicker

## Casos de Uso y Comportamiento Esperado

### CU-1: Renderizado Universal de DatePicker en Formularios
- **Dado** que un formulario modal o de página incluye un componente `p-datepicker` con `class="w-full"` o dentro de `.form-group`.
- **Cuando** se visualiza la pantalla.
- **Entonces** el datepicker debe ocupar el 100% del ancho asignado, tener bordes suaves (`var(--border-input)`), altura consistente con los demás inputs de formulario y el icono de calendario alineado a la derecha.

### CU-2: Selección de Fecha y Hora en Bloqueos de Pistas
- **Dado** que un administrador abre el modal de "Programar Bloqueo" en `facility-blocks`.
- **Cuando** interactúa con los campos "Fecha y hora de inicio" o "Fecha y hora de finalización".
- **Entonces** se despliega el panel oficial de PrimeNG con calendario y selectores de hora en formato 24h, sin recurrir al widget nativo del navegador.

### CU-3: Coherencia Visual con Filtros Existentes
- **Dado** que existen datepickers de filtro compacto en `bookings-grid`, `open-matches` o `activity-logs`.
- **Cuando** se aplican las reglas globales del Design System.
- **Entonces** mantienen sus tamaños compactos (`size="small"`) o amplios (`size="large"`), sus esquinas redondeadas y su estética corporativa.
