# Propuesta: Selector de Club en Topbar y Modal de Cambio de Club con Buscador

## 1. Contexto y Problema
En la versión actual de la plataforma multi-tenant:
1. **Sobrecarga visual en la barra lateral (Sidebar):** El nombre del club activo se muestra en una tarjeta compacta dentro del sidebar (`sidebar-club-card`), lo cual ocupa espacio vertical valioso y sobrecarga la navegación entre secciones.
2. **Falta de visibilidad contextual en el Topbar:** En la barra superior (`app-topbar`), el nombre del club activo se visualiza en un tamaño pequeño y plano, sin indicar la localidad o ciudad donde opera la sede (`city`), reduciendo la claridad para usuarios pertenecientes a múltiples clubes o sedes deportivas.
3. **Ausencia de acceso rápido para cambio de club:** Para alternar entre clubes, el usuario debe navegar manualmente hasta su perfil (`/profile`), desplazarse hasta la sección de membresías y pulsar "Cambiar de club". No existe un mecanismo global y directo desde cualquier vista de la aplicación.
4. **Dificultad de localización para usuarios con múltiples sedes:** Cuando un usuario o directivo pertenece a muchos clubes o centros deportivos, requiere un buscador en tiempo real para encontrar rápidamente su sede por nombre o ciudad.

---

## 2. Solución Propuesta
1. **Limpieza del Sidebar:**
   - Retirar la tarjeta del club activo (`sidebar-club-card`) del lateral.
   - El sidebar queda encabezado limpiamente por la marca ("SPT App PRO") pasando de inmediato a la navegación modular (`sidebar-nav`), mejorando la ergonomía visual.
2. **Prominencia y Ciudad en el Topbar:**
   - Destacar el nombre del club activo en el contenedor de contexto del topbar con una tipografía más prominente (`var(--font-size-md)` / `var(--font-weight-semibold)`).
   - Mostrar la ciudad del club (`clubCity`) junto a un icono sutil de ubicación (`pi pi-map-marker`) o separador semántico.
   - La ciudad ya está registrada en la entidad `Club` de la base de datos (según consta en Ajustes del Club). Solo se expone en `ClubMembershipSummaryDto` en backend (`apps/backend/src/auth/`) para que viaje en la sesión activa sin peticiones HTTP extras.
3. **Botón de Acción "Cambiar de club":**
   - Incorporar en el topbar un botón estilizado PrimeNG con directiva `pButton` (`size="small"`, variante `outlined` o `secondary`, icono `pi pi-sync`) con la etiqueta "Cambiar de club" (`USERS.CHANGE_CLUB`).
   - Visible cuando el usuario está autenticado y dispone de clubes registrados.
4. **Modal Centralizada de Selección de Club (`p-dialog`) con Buscador Integrado:**
   - Diálogo modal accesible PrimeNG (`p-dialog`) con ancho adaptativo (`[modal]="true"`, `[style]="{ width: '560px', maxWidth: '95vw' }"`).
   - **Buscador interactivo en cabecera de la modal:** Campo `p-iconfield` con icono `pi pi-search` e input `pInputText` para filtrar en tiempo real la lista de clubes por **nombre del club** o **ciudad**.
   - Lista interactiva de tarjetas filtradas:
     - Nombre del club, ciudad, rol del usuario (`p-tag`), estado activo (`p-tag` con severity="success") y saldo de monedero si aplica.
     - Botón de selección instantánea para alternar al nuevo club.
   - Al seleccionar un club:
     - Se actualiza el club activo en `AuthService` (`setActiveClub`).
     - Se persiste en `localStorage` (`spt_active_club_id`).
     - Se notifica mediante `NotificationService.success`.
     - Se cierra el diálogo automáticamente.
     - Si el usuario está en una ruta administrativa (`/admin/*`) y en el club seleccionado carece de permisos de administrador, se redirige de forma segura a `/portal`.

---

## 3. Criterios de Aceptación (CA)

- **CA-1 (Sidebar Despejado):** El sidebar no muestra la tarjeta `sidebar-club-card`. La cabecera del sidebar fluye directamente hacia la navegación.
- **CA-2 (Topbar Contextual Ampliado):** El topbar muestra el nombre del club activo con tamaño destacado y su ciudad (`clubCity`).
- **CA-3 (Botón de Cambio en Topbar):** Se incluye un botón PrimeNG para abrir el diálogo de cambio de club en el topbar cuando el usuario está autenticado.
- **CA-4 (Modal de Clubes con Buscador):** Se abre una modal PrimeNG (`p-dialog`) con un buscador en tiempo real (`p-iconfield` + `pInputText`) que filtra los clubes por nombre o ciudad de manera reactiva.
- **CA-5 (Activación y Persistencia):** Al hacer clic en un club no activo, se actualiza el estado global en `AuthService`, se emite feedback toast y se cierra la modal.
- **CA-6 (Integridad de BBDD y Tipos):** Riesgo cero en base de datos (campo existente). DTOs generados con Orval y consumidos vía `@core` sin interfaces duplicadas ni tipos `any`.
- **CA-7 (Internacionalización y Responsive):** Todas las etiquetas y placeholders consumen `es.json` y los componentes se adaptan perfectamente a pantallas móviles.
