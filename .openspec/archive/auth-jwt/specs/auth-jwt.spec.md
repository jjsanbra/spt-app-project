# Spec: auth-jwt (Fase 2)

**Fecha:** 2026-10-20  
**Versión:** 0.1.0  

---

## Descripción Funcional

Esta especificación detalla el funcionamiento del sistema de autenticación centralizada mediante JSON Web Tokens (JWT) y la gestión multi-tenant de usuarios para la plataforma SPT App. El sistema permite a los deportistas y administradores registrarse, iniciar sesión con control de roles y alternar entre los centros deportivos (clubes) donde poseen membresía sin perder su identidad de usuario global.

---

## Reglas de Negocio

1. **RN-01 (Cuenta Global Única):** El email de usuario es único a nivel de plataforma (`@@unique([email])`). Un usuario utiliza las mismas credenciales independientemente de los clubes a los que pertenezca.
2. **RN-02 (Cifrado de Credenciales):** Las contraseñas se almacenan obligatoriamente con algoritmo de hasheo seguro `bcrypt` utilizando al menos 10 rondas de salt.
3. **RN-03 (Tokens de Sesión):**
   - El `access_token` tiene un tiempo de expiración de 15 minutos y viaja en la cabecera `Authorization: Bearer <token>`.
   - El `refresh_token` tiene una vigencia de 7 días y permite renovar el `access_token` sin solicitar credenciales nuevamente.
4. **RN-04 (Aislamiento de Tenant en Solicitudes):** Para acceder a recursos o realizar acciones asociadas a un club, la petición debe incluir obligatoriamente la cabecera `x-tenant-id`.
5. **RN-05 (Validación de Membresía y Rol):** El `TenantGuard` comprueba que el usuario autenticado posea un registro activo en `ClubMembership` para el `club_id` indicado. Si no pertenece al club, se devuelve `403 Forbidden`.
6. **RN-06 (Perfil Multi-Club):** La consulta `GET /api/v1/auth/me` devuelve los datos personales del usuario y el listado de todos los clubes a los que está vinculado con su rol específico (`OWNER`, `ADMIN`, `STAFF`, `MEMBER`, `GUEST`) y saldo de monedero.

---

## Casos de Uso (BDD)

### CU-01: Registro de nuevo usuario

**Actor:** Usuario no registrado  
**Escenario:** Registro exitoso con datos válidos  
- **Dado** que un visitante accede a la pantalla de registro en `spt-users`
- **Cuando** introduce un email no registrado, contraseña de al menos 8 caracteres, nombre y apellidos
- **Y** pulsa el botón con directiva `pButton` "Crear cuenta"
- **Entonces** el sistema devuelve código HTTP `201 Created` con los tokens de sesión y el perfil del usuario
- **Y** se redirige al usuario a la vista de bienvenida o selección de club

**Escenario alternativo:** Intento de registro con email duplicado  
- **Dado** que un usuario intenta registrarse con un email que ya existe en la base de datos
- **Cuando** envía el formulario de registro
- **Entonces** el servidor responde con código HTTP `409 Conflict` y mensaje de error traducido
- **Y** la interfaz muestra una alerta de error mediante `p-toast` sin recargar la página

---

### CU-02: Inicio de sesión (Login)

**Actor:** Usuario registrado  
**Escenario:** Autenticación exitosa  
- **Dado** que un usuario con cuenta activa introduce su email y contraseña correctos
- **Cuando** pulsa el botón `pButton` "Acceder"
- **Entonces** el servidor devuelve `200 OK` con `accessToken`, `refreshToken` y datos del usuario
- **Y** el servicio `AuthService` almacena el token y actualiza los Signals reactivos de sesión
- **Y** la aplicación redirige al portal de reservas o al panel de administración según los roles del usuario

---

### CU-03: Consulta de contexto de usuario y clubes (`/auth/me`)

**Actor:** Usuario autenticado  
**Escenario:** Carga del perfil y clubes tras autenticación  
- **Dado** que el usuario dispone de un `access_token` válido
- **Cuando** el Shell `spt-app` realiza una petición `GET /api/v1/auth/me` con la cabecera `Authorization: Bearer <token>`
- **Entonces** el backend devuelve los datos personales y el array de membresías activas (`memberships`)
- **Y** el selector de club muestra los clubes disponibles para operar
- **Y** el `AuthInterceptor` fija el `club_id` seleccionado en la cabecera `x-tenant-id` para las llamadas posteriores

---

### CU-04: Renovación de sesión expirada (Refresh Token)

**Actor:** Cliente HTTP / Usuario con token caducado  
**Escenario:** Renovación transparente de Access Token  
- **Dado** que el `access_token` ha expirado (más de 15 minutos)
- **Cuando** una petición a la API devuelve `401 Unauthorized`
- **Entonces** el interceptor de `@core` captura el error, llama a `POST /api/v1/auth/refresh` con el `refreshToken`
- **Y** al recibir el nuevo `accessToken`, reintenta la petición original de forma transparente para el usuario
