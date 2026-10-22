# Delta de Especificación: Corrección de Estilos en Sidebar Logout y DatePicker PrimeNG

## 1. Alcance
Aplica a los componentes del Shell Host (`spt-app`), el Design System central (`spt-app/src/styles/components/`) y su consumo por componentes de microfrontend como `bookings-grid` en `spt-portal`.

## 2. Requerimientos Funcionales y de UI

### RF-01: Botón de Cierre de Sesión en el Sidebar
- El botón de logout en el pie del sidebar debe renderizarse con un icono `pi pi-sign-out` perfectamente visible y centrado.
- Las dimensiones del botón deben ser circulares de `2.25rem` por `2.25rem` (`var(--radius-full)`), alineado simétricamente con el botón de alternancia de tema.
- Debe poseer retroalimentación visual al hacer hover (escalado sutil y cambio de color a fondo de peligro).

### RF-02: Panel Desplegable de DatePicker (Calendario)
- El panel emergente de DatePicker (`.p-datepicker-panel`) debe contar con un fondo completamente opaco utilizando el token `var(--surface-card)`.
- Debe poseer bordes redondeados (`var(--radius-md)`), borde delimitador `var(--border-subtle)` y sombra de elevación `var(--shadow-tier3)`.
- No debe traslucir ningún texto, cuadrícula ni botón situado detrás en el DOM.
- La cabecera debe permitir navegar meses con flechas claras y el mes/año visible en `var(--text-color)`.
- Los días de la semana deben mostrarse atenuados con `var(--text-dim)`.
- El día seleccionado debe resaltar con `var(--primary-gradient)` y color de texto blanco.
- El día de hoy debe estar delimitado con un borde distintivo.
