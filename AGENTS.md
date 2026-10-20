# Reglas y Directivas para Agentes de IA en `spt-app-project`

## 🔒 Control de Versiones y Git (Regla Crítica)

- **PROHIBICIÓN ESTRICTA DE COMMITS / PUSHES AUTOMÁTICOS:**
  - NUNCA ejecutes `git commit` ni `git push` automáticamente tras realizar cambios, tareas o migraciones.
  - Deja siempre los cambios en el *working tree* (área de trabajo local) para que el usuario pueda revisarlos.
  - Solo ejecuta comandos de commit o push cuando el usuario lo solicite de forma **expresa y literal** (ej: *"haz commit"*, *"commitea y sube a remoto"*, *"prepara commit"*).

- **ARCHIVADO AUTOMÁTICO DE OPENSPEC AL PREPARAR COMMIT:**
  - Cuando el usuario solicite preparar commit (ej: *"prepara commit"*, *"haz commit"*), archiva AUTOMÁTICAMENTE los cambios activos de OpenSpec (`.openspec/changes/*`) ejecutando `node scripts/spec-archive.js <nombre-del-cambio>` antes de hacer el commit, asegurando que las especificaciones canónicas y el catálogo queden sincronizados e incluidos en el commit.

---

## 🛡️ Integridad de Base de Datos y Prevención de Pérdida de Datos en Producción (Regla Crítica)

- **EVALUACIÓN OBLIGATORIA DE RIESGO EN BBDD:**
  - Ante cualquier cambio que involucre directa o indirectamente la base de datos (esquemas de Prisma en `apps/backend/prisma/schema.prisma`, migraciones SQL, restricciones `NOT NULL`, defaults, claves foráneas, semillas `seed.ts` o scripts de mantenimiento), se debe valorar rigurosamente si existe riesgo de romper la base de datos en producción o de pérdida/corrupción de datos.
- **AISLAMIENTO MULTI-TENANT ESTRICTO (`club_id`):**
  - Toda entidad perteneciente a un centro deportivo (`Facility`, `FacilityBlock`, `PricingRule`, `Booking`, `Payment`) debe incluir `club_id` como clave foránea obligatoria e índice compuesto.
- **NOTIFICACIÓN INMEDIATA Y BLOQUEO PREVIO:**
  - Si existe el más mínimo riesgo de inconsistencia, fallo en producción, fuga de datos entre inquilinos o pérdida de información, se debe NOTIFICAR DE INMEDIATO y de forma explícita al usuario detallando el análisis de riesgo.
  - **PROHIBIDO REALIZAR NINGÚN CAMBIO DESTRUCTIVO** en la base de datos sin la validación previa, expresa y confirmada por parte del usuario.

---

## 🇪🇸 Convenciones de Idioma
- Todas las respuestas, explicaciones, especificaciones funcionales (`.openspec/specs/`), propuestas (`proposal.md`), diseños (`design.md`) y tareas (`tasks.md`) deben estar redactadas en **español**.

---

## 🏗️ Flujo de Arquitectura y Planificación Spec-Driven Development (OpenSpec) (Regla Crítica)
- **PLANIFICACIÓN OBLIGATORIA CON OPENSPEC:**
  - Ante cualquier solicitud de planificación, diseño o nuevo evolutivo/cambio, es OBLIGATORIO utilizar OpenSpec.
  - NUNCA planifiques en artefactos o archivos sueltos fuera del ciclo de vida de OpenSpec.
  - Ejecuta siempre `node scripts/spec-new-change.js <nombre-del-cambio>` para crear el andamiaje estructurado en `.openspec/changes/<nombre>/`.
  - Redacta de forma exhaustiva y en español:
    1. `proposal.md`: Contexto, problema de negocio, solución propuesta y criterios de aceptación (CA).
    2. `design.md`: Contratos OpenAPI/DTOs, modelos afectados, diseño de UI, evaluación de riesgo en BBDD y decisiones de arquitectura (incluyendo diagramas Mermaid).
    3. `tasks.md`: Fases y tareas secuenciales con checkboxes.
    4. `specs/*.spec.md`: Deltas de especificación funcional con reglas de negocio y casos de uso.
- **FLUJO SDD:**
  1. Especificaciones y cambios activos en `.openspec/changes/`
  2. Entidades de datos en `apps/backend/prisma/schema.prisma` y DTOs/Controladores en `apps/backend/src/`
  3. Sincronización de tipos y clientes de frontend con `npm run api:generate` (Orval)
  4. Consumo de modelos y servicios desde `@core` en los microfrontends de Angular
  5. Archivado automático con `node scripts/spec-archive.js <nombre>` al solicitar commit

---

## 📦 Patrón de Modelos y Tipos de Datos (Orval y @core)
- **PROHIBICIÓN ESTRICTA DE INTERFACES DUPLICADAS EN COMPONENTES:**
  - NUNCA declares interfaces manuales en componentes locales para representar entidades de dominio o payloads de petición que ya existan o viajen a la API (ej: `CreateBookingPayload`, `FacilityDto`, `PricingRuleModel`, etc.).
  - Consume siempre los modelos e interfaces generados automáticamente por Orval importándolos desde `@core` (`CreateBookingRequest`, `FacilityResponse`, `BookingDetails`, `ClubMembershipDto`, etc.).
  - Si un evento de UI requiere un identificador de ruta adicional o campo visual (como un `id` o estado local), extiende o compone el tipo generado por Orval en lugar de redefinir sus propiedades desde cero:
    ```typescript
    import { CreateBookingRequest } from '@core';

    export interface BookingModalPayload extends CreateBookingRequest {
      facilityName: string;
    }
    ```

---

## 🔘 Botones y Componentes UI de PrimeNG (Regla de Desarrollo)
- **USO OBLIGATORIO DE LA DIRECTIVAS pXxxxxx por ejemplo `pButton`, `pInputText`, `pCard`, `pDialog`, `pDataTable`, `pBadge`, `pDropdown`, `pCalendar`, etc.:**
  - NUNCA utilices etiquetas `<button>` nativas sin las directivas `pButton`, `pInputText`, `pCard`, `pDialog`, `pDataTable`, `pBadge`, `pDropdown`, `pCalendar`, etc. de PrimeNG.
  - Todos los botones en cualquier plantilla de Angular (`apps/frontend/projects/`) deben incluir obligatoriamente el atributo directiva `pButton` (ej: `<button type="button" pButton ...>`), configurando sus atributos semánticos (`severity`, `[text]="true"`, `[outlined]="true"`, `size`, etc.) e importando `ButtonModule` desde `'primeng/button'` en el componente standalone.
  - Esta directiva es obligatoria para todos los desarrollos presentes y futuros.

---

## 🎨 Design System, Variables y Arquitectura Modular de Estilos (Regla Permanente)
- **FRONTERA DE ESTILOS: DESIGN SYSTEM VS COMPONENTES DE MICROFRONTEND:**
  - **Design System Central (`apps/frontend/projects/spt-app/src/styles/components/_<nombre>.scss`):**
    - Reservado EXCLUSIVAMENTE para componentes base reutilizables, UI Kit transversal y sobreescrituras del framework PrimeNG (`_buttons.scss`, `_tables.scss`, `_badges.scss`, `_forms.scss`, `_cards.scss`, `_dialogs.scss`).
    - Se registran en el manifiesto central `apps/frontend/projects/spt-app/src/styles/_index.scss` y se comparten a todos los microfrontends.
    - PROHIBIDO colocar en esta carpeta vistas, pantallas completas o plantillas específicas de una funcionalidad de un microfrontend de negocio (como `court-schedule`, `admin-pricing`, `booking-wizard`, etc.).
  - **Vistas y Componentes Locales de Microfrontend (`apps/frontend/projects/<mfe>/src/app/...`):**
    - Las maquetaciones, layouts y componentes específicos de un microfrontend (`spt-admin`, `spt-portal`, `spt-users`) deben estructurarse en los archivos `.component.scss` del propio componente, respetando el encapsulamiento de Angular (`ViewEncapsulation.Emulated`).
    - Consumen obligatoriamente los tokens de diseño importando `@use "../../../spt-app/src/styles/index" as *;` (o la ruta relativa equivalente).
- **PROHIBICIÓN ESTRICTA DE VALORES HARDCODEADOS EN SCSS/CSS:**
  - NUNCA utilices valores literales hardcodeados (colores hexadecimales, tamaños en px/rem directos sin variable, márgenes o radios aislados).
  - Utiliza OBLIGATORIAMENTE los tokens semánticos definidos en `apps/frontend/projects/spt-app/src/styles/base/_variables.scss`:
    - **Espaciados y Márgenes:** `var(--spacing-2xs)`, `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-base)`, `var(--spacing-lg)`, `var(--spacing-xl)`, `var(--spacing-2xl)`.
    - **Radios de Borde:** `var(--radius-xs)`, `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-xl)`, `var(--radius-full)`.
    - **Escala de Tamaños de Fuente:** `var(--font-size-2xs)`, `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-md)`, `var(--font-size-lg)`, `var(--font-size-xl)`, `var(--font-size-2xl)`.
    - **Pesos de Fuente:** `var(--font-weight-regular)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`, `var(--font-weight-bold)`, `var(--font-weight-extrabold)`.
    - **Colores y Superficies:** `var(--surface-pure)`, `var(--surface-muted)`, `var(--surface-card)`, `var(--border-subtle)`, `var(--primary-color)`, `var(--text-color)`, etc.
- **USO OBLIGATORIO DE MIXINS RESPONSIVOS DEL SISTEMA DE DISEÑO (PROHIBIDO `@media` MANUAL):**
  - PROHIBIDO escribir `@media` queries directas o breakpoints hardcodeados (`max-width: 640px`, `max-width: 768px`, etc.) en las hojas de estilo.
  - Se deben importar y utilizar OBLIGATORIAMENTE los mixins responsivos oficiales definidos en `apps/frontend/projects/spt-app/src/styles/base/_responsive.scss`:
    - `@include mobile-xs`: Smartphones compactos (`<= 480px`).
    - `@include mobile`: Smartphones estándar (`<= 640px`).
    - `@include tablet`: Dispositivos tablet (`641px - 1024px`).
    - `@include mobile-or-tablet`: Móvil o tablet combinados (`<= 1024px`).
    - `@include desktop`: Escritorio (`> 1024px`).

---

## 🌐 Internacionalización y Textos (Regla Permanente de Desarrollo)
- **PROHIBICIÓN ESTRICTA DE TEXTOS O LITERALES HARDCODEADOS:**
  - NUNCA introduzcas textos, títulos, descripciones, etiquetas de formularios, placeholders, mensajes de validación/error, tooltips o botones con texto hardcodeado en las plantillas HTML o componentes de TypeScript.
  - Todos los textos deben consumirse OBLIGATORIAMENTE a través del sistema de internacionalización (`ngx-translate`) utilizando la tubería `{{ 'SECCION.CLAVE' | translate }}` en plantillas o `this.translate.instant('SECCION.CLAVE')` en TypeScript.
  - Toda nueva clave de traducción debe declararse de forma obligatoria y estructurada en el diccionario central `apps/frontend/projects/spt-app/src/assets/i18n/es.json`.
  - Esta directiva aplica a todos los microfrontends presentes y futuros (`spt-app`, `spt-admin`, `spt-portal`, `spt-users`).

---

## 🧠 CodeGraph e Indexación de Dependencias
- Mantén la estructura de código, decoradores NestJS e interfaces limpios para que CodeGraph mapee y sincronice correctamente las relaciones entre microfrontends, capas y backend.
- Tras completar evolutivos relevantes o crear nuevos módulos/controladores, ejecuta `npm run codegraph:sync` para refrescar el grafo.
