# Especificación: Hardening y Seguridad para Producción

## Delta Funcional

### R-SEC-01: Limitación de Tasa General (Rate Limiting)
- El sistema debe controlar el número de peticiones que una misma dirección IP puede realizar en una ventana de 60 segundos.
- Límite global por defecto: 100 peticiones por minuto.
- Si se sobrepasa, la API responde con código HTTP `429 Too Many Requests` y cuerpo JSON canónico de error.

### R-SEC-02: Protección Anti-Fuerza Bruta en Autenticación
- Los endpoints de acceso (`POST /api/v1/auth/login`) y registro (`POST /api/v1/auth/register`) deben contar con un límite estricto de 5 intentos por minuto por dirección IP.
- Una vez alcanzado el límite, se bloquean peticiones subsiguientes devolviendo `429`.

### R-SEC-03: Estandarización de Errores y Protección de Trazas
- Todas las respuestas de error (4xx y 5xx) deben retornar un formato JSON uniforme con las propiedades: `statusCode`, `message`, `error`, `timestamp` y `path`.
- En entorno de producción (`NODE_ENV=production`), los errores de servidor `500` nunca deben exponer la traza de pila (stacktrace) ni mensajes internos de la base de datos PostgreSQL/Prisma.

### R-SEC-04: Trazabilidad y Logging Estructurado
- Toda petición entrante a la API debe registrarse indicando método HTTP, URL, código de respuesta HTTP devuelto y tiempo de procesamiento en milisegundos.
