# Propuesta: Corrección de Estilos de Checkboxes y Espaciados de Registro

## 1. Contexto de Negocio
En los flujos de autenticación y formularios de la plataforma SaaS de SPT, se han detectado dos anomalías visuales críticas que degradan la experiencia de usuario:
1. **Checkboxes deformados (`p-checkbox`):** El componente de checkbox de PrimeNG en vistas como Login («Recordar usuario») y modales administrativos colapsa en un diminuto punto grisáceo de 3px sin dimensiones perceptibles ni estilos del sistema de diseño, impidiendo al usuario interactuar cómodamente.
2. **Espaciados comprimidos en Registro (`register`):** En la pantalla de registro (`/register`), las etiquetas y los campos de entrada se encuentran excesivamente juntos (`gap: 2px`), y los grupos de formulario carecen de una separación vertical adecuada frente a inputs grandes (`pSize="large"`), generando saturación visual y dificultando la lectura.

## 2. Solución Propuesta
1. **Estandarización Universal del Checkbox en el Design System (`_variables.scss` y `_forms.scss`):**
   - Declarar tokens semánticos en `apps/frontend/projects/spt-app/src/styles/base/_variables.scss` (`--p-checkbox-width: 1.25rem`, `--p-checkbox-height: 1.25rem`, `--p-checkbox-border-radius`, etc.).
   - Reforzar las reglas base en `apps/frontend/projects/spt-app/src/styles/components/_forms.scss` para garantizar un tamaño de caja de `20px x 20px`, bordes sutiles, fondo puro, alineación centrada y el icono de check en blanco sobre el color primario de marca (`--primary-color: #FF2D78`).
   - Ajustar el alineamiento flex del contenedor `.form-group-checkbox` con la etiqueta contigua.
2. **Armonización de Espaciados en Registro (`register.component.scss`):**
   - Aumentar el espaciado entre campos a `var(--spacing-lg)` (20px) para dar aire a cada grupo de datos.
   - Ajustar la separación entre etiqueta e input a `6px` para una clara asociación visual.
   - Mejorar la separación entre columnas del nombre y apellidos (`form-row`) y el margen del pie de acciones y enlace inferior.

## 3. Criterios de Aceptación (CA)
- **CA-01 (Dimensiones y Estilo del Checkbox):** Todo `<p-checkbox>` debe renderizarse con un tamaño visible de `20px x 20px` (`1.25rem`), bordes redondeados (`var(--radius-xs)`), fondo blanco e icono de verificación centrado cuando está activo.
- **CA-02 (Alineación con Etiqueta):** El texto descriptivo contiguo («Recordar usuario») debe estar verticalmente alineado al centro del checkbox con un margen horizontal de `8px` (`var(--spacing-sm)`).
- **CA-03 (Espaciado en Registro):** El formulario de registro debe presentar una jerarquía visual holgada, con al menos `20px` de distancia entre bloques de formulario y `6px` entre cada label y su campo.
- **CA-04 (Integridad de Tests):** Todas las pruebas unitarias de `spt-users` y del resto del frontend deben continuar pasando al 100%.
