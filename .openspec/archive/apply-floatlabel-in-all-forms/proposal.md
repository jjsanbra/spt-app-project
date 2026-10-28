# Propuesta: Estandarización Universal de Etiquetas Flotantes (`p-floatlabel variant="in"`) en Todos los Formularios

## 1. Contexto y Problema de Negocio
Actualmente, los formularios en los microfrontends de la plataforma (`spt-users`, `spt-admin`, `spt-portal`) utilizan una estructura tradicional de etiquetas estáticas superiores (`<label class="form-label">...`) separadas de los campos de entrada (`<input>`, `<p-select>`, `<p-password>`, etc.). Esta estructura genera un consumo vertical excesivo en modales y pantallas de autenticación/perfil, además de inconsistencias visuales donde coexisten etiquetas superiores con `placeholder` repetitivos dentro del campo.

PrimeNG 22 provee el componente oficial `<p-floatlabel>` con la variante `variant="in"`, la cual integra de forma elegante y compacta la etiqueta dentro del marco del input con animación fluida, alineándose perfectamente con el sistema de diseño Figma Athletic Luxury de SPT App.

## 2. Solución Propuesta
Estandarizar de forma universal el patrón `<p-floatlabel variant="in">` en todos los formularios interactivos de la plataforma:
1. **Autenticación y Usuario (`spt-users`):**
   - Formulario de Inicio de Sesión (`login.component.html`)
   - Formulario de Registro (`register.component.html`)
   - Formulario de Mi Perfil (`profile.component.html`)
2. **Administración y Gestión (`spt-admin`):**
   - Modal de Creación/Edición de Pistas (`facilities-list.component.html`)
   - Modal de Bloqueo de Pistas (`facility-blocks.component.html`)
   - Modal de Reglas de Tarifas (`pricing-list.component.html`)
   - Modales de Invitación y Cambio de Rol de Miembros (`club-members.component.html`)
   - Modal de Configuración de Club (`club-settings.component.html`)
   - Modal de Creación de Clubes de Superadministrador (`superadmin-clubs.component.html`)
3. **Portal de Jugadores (`spt-portal`):**
   - Formulario/Modal de Confirmación de Reserva (`bookings-grid.component.html`)

## 3. Criterios de Aceptación (CA)
- **CA-01:** Todos los campos de entrada (`input[pInputText]`, `p-password`, `p-select`, `textarea[pTextarea]`, `p-datepicker`) en los formularios identificados deben estar envueltos en `<p-floatlabel variant="in" class="w-full">` con su respectivo `<label for="...">`.
- **CA-02:** Los textos de los labels deben consumirse rigurosamente vía `ngx-translate` con la tubería `{{ 'SECCION.CLAVE' | translate }}` (prohibido texto hardcodeado).
- **CA-03:** Se deben retirar los atributos `placeholder` estáticos en los inputs que compitan con la etiqueta flotante, preservando la animación y legibilidad en vacío.
- **CA-04:** Los mensajes de error y validación (`<small class="form-error">`) deben ubicarse fuera del contenedor `<p-floatlabel>` manteniendo el flujo visual de retroalimentación.
- **CA-05:** Los componentes deben importar de forma explícita y canónica `FloatLabel` desde `'primeng/floatlabel'`.
- **CA-06:** Todas las suites de pruebas unitarias (`test:frontend`) deben pasar al 100% (255/255) y la compilación (`build:all`) debe completarse sin advertencias críticas ni errores.
