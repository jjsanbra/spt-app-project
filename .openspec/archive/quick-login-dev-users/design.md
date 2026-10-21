# Diseño Técnico: Acceso Rápido con Usuarios de Prueba en Login Local (`quick-login-dev-users`)

## Arquitectura de Componentes

```mermaid
graph TD
    A[Carga de LoginComponent spt-users] --> B{¿Es Entorno Local?}
    B -->|No - Producción en Render| C[Formulario de Login Estándar]
    B -->|Sí - Localhost / isDevMode| D[Mostrar Panel Quick-Login con 4 Roles Demo]
    D --> E[Click en Usuario Demo: Superadmin / Admin / Socio / Invitado]
    E --> F[Autocompletar Formulario loginForm.patchValue]
    F --> G[Ejecución automática de onSubmit()]
    G --> H[Autenticación y Redirección Inteligente]
```

## Estructura de Datos de Usuarios Demo
```typescript
export interface QuickLoginUser {
  labelKey: string;
  roleBadgeKey: string;
  email: string;
  password: string;
  icon: string;
  severity: 'danger' | 'warn' | 'success' | 'info';
}
```

## Evaluación de Riesgo en Base de Datos
- **Riesgo:** **0% (Nulo)**.
- **Justificación:** Se trata de una mejora exclusiva de experiencia de desarrollo (DX) en el componente de interfaz de usuario de Angular. No altera tablas, índices, columnas ni migraciones de PostgreSQL.
- **Seguridad en Producción:** La condición en plantilla `@if (isLocalEnvironment)` previene la renderización de las credenciales de demo en compilaciones de producción en Render.
