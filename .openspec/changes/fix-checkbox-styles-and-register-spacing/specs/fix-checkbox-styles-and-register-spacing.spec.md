# Especificación: Corrección de Checkboxes y Espaciados de Registro

## 1. Casos de Uso y Comportamiento Esperado

### 1.1 Renderizado de Checkboxes
- **CU-01:** Dado un componente `<p-checkbox>` en cualquier vista (Login, filtros o modales), debe mostrarse una casilla cuadrada de `20px x 20px` con bordes redondeados sutiles (`4px`), fondo blanco sobre superficies claras y transición suave.
- **CU-02:** Al estar marcado (`checked="true"`), el fondo de la casilla debe ser de color magenta primario (`--primary-color: #FF2D78`) y mostrar el icono de verificación blanco (`color: #FFFFFF`) perfectamente centrado.
- **CU-03:** Al hacer foco o pasar el ratón, debe resaltar con el color primario de marca (`--primary-hover` / `--primary-color`).

### 1.2 Formulario de Registro
- **CU-04:** En la pantalla de registro (`/register`), los campos Nombre y Apellidos deben distribuirse en cuadrícula equilibrada de 2 columnas en pantallas medianas/grandes y apilarse en una sola columna en pantallas móviles.
- **CU-05:** La distancia vertical entre cada bloque de formulario debe ser de `20px` (`var(--spacing-lg)`) y la distancia entre la etiqueta (`.form-label`) y el input debe ser de `6px`, garantizando un ritmo vertical legible sin solapamientos.
