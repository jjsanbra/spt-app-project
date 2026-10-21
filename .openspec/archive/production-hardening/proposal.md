# Propuesta: Hardening y Seguridad para Producción (`production-hardening`)

## 1. Contexto y Problema de Negocio
El sistema cuenta con todos los módulos funcionales de negocio (autenticación multi-tenant, gestión de instalaciones y precios, motor de reservas de pistas, partidas abiertas, notificaciones en tiempo real vía WebSocket y panel SuperAdmin).

Sin embargo, para garantizar la resiliencia y seguridad en un entorno de producción (como Render):
1. **Ausencia de interceptación por Rate Limiting**: Aunque `@nestjs/throttler` está instalado y configurado en `AppModule`, no existe un `ThrottlerGuard` registrado como `APP_GUARD`, por lo que las peticiones no sufren limitación real. Endpoints críticos como `/auth/login` y `/auth/register` están expuestos a ataques de fuerza bruta y enumeración de contraseñas.
2. **Falta de estandarización en errores y fuga de trazas**: No existe un filtro global de excepciones (`AllExceptionsFilter`). Errores no controlados (500) pueden filtrar información interna de la base de datos o trazas de pila en producción.
3. **Observabilidad y Auditoría de Peticiones**: Falta un interceptor de logging estructurado (`LoggingInterceptor`) que mida la latencia de peticiones HTTP, métodos, rutas y códigos de estado para depuración y métricas en logs de Render.

---

## 2. Solución Propuesta

### 2.1 Activación Global y Personalizada de Rate Limiting
- Vincular `ThrottlerGuard` a nivel global en `AppModule` mediante el provider `{ provide: APP_GUARD, useClass: ThrottlerGuard }`.
- Configurar un límite general por defecto de **100 peticiones / minuto** para la API.
- Aplicar decoradores `@Throttle({ default: { limit: 5, ttl: 60000 } })` en endpoints sensibles de autenticación (`/api/v1/auth/login`, `/api/v1/auth/register`) para prevenir ataques de fuerza bruta.

### 2.2 Filtro Global de Excepciones Canónico (`AllExceptionsFilter`)
- Crear un `AllExceptionsFilter` registrado globalmente en `main.ts` o `AppModule`.
- Formatear todas las respuestas de error bajo una estructura canónica uniforme:
  ```json
  {
    "statusCode": 400,
    "message": "Mensaje legible o array de validaciones",
    "error": "Bad Request",
    "timestamp": "2026-10-21T16:45:00.000Z",
    "path": "/api/v1/auth/login"
  }
  ```
- En entorno `production`, enmascarar los fallos `500 Internal Server Error` protegiendo los detalles de la infraestructura y persistiendo el error en el logger de servidor.

### 2.3 Interceptor de Logging y Latencia (`LoggingInterceptor`)
- Crear un interceptor que registre de forma concisa cada petición: `[HTTP] POST /api/v1/bookings 201 +45ms`.
- Detectar cuellos de botella en endpoints con latencias anómalas.

---

## 3. Criterios de Aceptación (CA)

- **CA-1 (Rate Limiting General)**: Peticiones concurrentes excesivas (>100 req/min por IP) deben devolver `429 Too Many Requests`.
- **CA-2 (Protección Fuerza Bruta Auth)**: Más de 5 intentos fallidos de login/registro en 1 minuto desde la misma IP devuelven `429 Too Many Requests` con cabeceras `Retry-After`.
- **CA-3 (Formato de Error Canónico)**: Cualquier excepción HTTP o error no controlado genera el esquema JSON estructurado con `statusCode`, `message`, `error`, `timestamp` y `path`.
- **CA-4 (Ocultación de Trazas 500)**: En `NODE_ENV=production`, las excepciones no controladas no exponen stacktraces ni detalles de PostgreSQL/Prisma al cliente.
- **CA-5 (Estabilidad de Tests)**: Las suites de pruebas de backend (`npm run test:backend`) y frontend (`npm run test:frontend`) deben continuar pasando al 100%.
