# Especificación Funcional: Acceso Rápido con Usuarios de Prueba en Login Local (`quick-login-dev-users`)

## Requerimientos

### R-DEV-01: Aislamiento de Entorno
- El bloque de usuarios demo solo debe estar activo y visible cuando el código se ejecute en entorno de desarrollo (`isDevMode() === true` o hostname `localhost` / `127.0.0.1`).
- En compilaciones para producción desplegadas en Render o dominios públicos, el bloque no debe mostrarse ni exponer credenciales.

### R-DEV-02: Perfiles Preconfigurados
- Se deben presentar los 4 perfiles del seed de desarrollo:
  1. Superadministrador (`superadmin@spt-app.local`)
  2. Administrador de Club (`admin@centralpadel.local`)
  3. Socio con monedero (`socio@spt-app.local`)
  4. Invitado (`invitado@spt-app.local`)

### R-DEV-03: Interacción y Autocompletado
- Al hacer clic en un usuario demo, se deben poblar los campos `email` y `password` del formulario de login.
- Se debe disparar el proceso de autenticación automáticamente, redirigiendo al panel admin (para Superadmin y Admin) o al portal de reservas (para Socio e Invitado).

### R-DEV-04: Componentes UI y Accesibilidad
- Los botones de acceso rápido deben usar la directiva `pButton` con variante `outlined` o `text` según la jerarquía visual de PrimeNG.
- Todas las etiquetas, títulos y descripciones deben consumirse mediante `ngx-translate`.
