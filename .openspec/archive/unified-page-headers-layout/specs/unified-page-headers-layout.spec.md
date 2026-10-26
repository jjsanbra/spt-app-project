# Delta de Especificación Funcional: Unificación de Layout de Cabeceras de Páginas

## 1. Visión General
Esta especificación define el estándar unificado para la presentación de cabeceras de página (`page-header`) en todas las pantallas operativas y de gestión de la plataforma deportiva multi-tenant.

## 2. Requerimientos Funcionales

### RF-1: Disposición y Estructura Semántica Unificada
Toda pantalla principal o submódulo debe presentar un encabezado semántico `<header role="banner" class="page-header">` compuesto por:
1. **Área de Identificación Izquierda:**
   - Enlace o botón de retorno accesible si la vista es hija de otra vista (`backUrl`, `backLabel`).
   - Icono contextual opcional alineado con el título.
   - Título principal estructurado como encabezado `<h1>` con la tipografía de encabezados del sistema (`--font-heading`, `--font-size-xl`, `--font-weight-bold`).
   - Badge o Tag de PrimeNG opcional (`p-tag`) para especificar contexto dinámico (nombre de la pista, estado o entidad).
   - Subtítulo descriptivo opcional en tipografía de cuerpo atenuada (`--text-muted`, `--font-size-sm`).
2. **Área de Acciones y Herramientas Derecha:**
   - Agrupación horizontal (`flex`, `gap: var(--spacing-sm)`) de controles contextuales y botones de acción.
   - Todo botón debe usar obligatoriamente la directiva `pButton` con sus severidades estandarizadas (`primary`, `secondary`, `outlined`, etc.).
   - Admite selectores (`p-select`) para filtros rápidos de entidad (ej: selector de pista en bloqueos).

### RF-2: Comportamiento Responsivo Multi-Dispositivo
- **Desktop (`> 1024px`):** Las acciones se sitúan a la derecha en la misma fila que los títulos (`justify-content: space-between`).
- **Tablet (`641px - 1024px`):** Se permite wrap natural cuando los títulos o acciones sean extensos, manteniendo márgenes estándar (`var(--spacing-md)`).
- **Móvil (`<= 640px`):**
  - La cabecera se reordena en columna vertical (`flex-direction: column; align-items: stretch`).
  - Los títulos ocupan el ancho completo.
  - El contenedor de acciones se sitúa debajo de los títulos y los botones ocupan el ancho disponible o se distribuyen uniformemente para facilitar el toque táctil.

### RF-3: Casos de Uso Específicos por Pantalla

#### CU-1: Pantallas Maestras de Administración (`facilities-list`, `pricing-list`, `club-members`, `superadmin-clubs`)
- **Título:** Nombre del catálogo (ej: "Pistas y Espacios").
- **Subtítulo:** Descripción explicativa de gestión.
- **Acciones:** Botón primario de creación (`+ Nueva Pista`, `+ Nueva Tarifa`, `+ Invitar Miembro`, `+ Nuevo Club`).

#### CU-2: Pantalla de Detalle o Submódulo Jerárquico (`facility-blocks`)
- **Navegación:** Enlace de retorno `← Volver a Pistas` hacia `/admin/facilities`.
- **Título:** "Bloqueos y Mantenimiento".
- **Badge:** Tag con el nombre de la pista actual (`— Pista 1 Central`).
- **Subtítulo:** Explicación del funcionamiento de bloqueos.
- **Acciones:** Selector de pista si el club tiene más de 1 pista + Botón primario `+ Nuevo Bloqueo`.

#### CU-3: Pantalla de Auditoría y Registros (`activity-logs`, `user-activity`)
- **Icono:** `pi pi-history`.
- **Título:** "Registro de Actividad y Auditoría" / "Mi Historial de Actividad".
- **Subtítulo:** Descripción del registro.
- **Acciones:** Fuera de la cabecera, la barra de filtros se consolida en un `p-toolbar` estándar antes de la tabla, desvinculando el título del contenedor `p-card` para guardar simetría con el resto de pantallas.

#### CU-4: Cuadrícula y Reservas del Portal (`bookings-grid`, `my-bookings`, `open-matches`)
- **Título:** "Reserva de Pistas" / "Mis Reservas" / "Partidos Abiertos".
- **Subtítulo:** Indicaciones operativas de reserva.
- **Acciones:** Botón secundario/outline `Mis Reservas` (en grid) o primario `Nueva Reserva` (en mis reservas).
