# Proposal: bookings-calendar-grid-refactor

**Fecha:** 2026-10-22  
**Estado:** 🟢 Completado  
**Autor:** Antigravity AI  

---

## 1. Contexto y Motivación

En la vista actual de **Reserva de Pistas y Disponibilidad** (`spt-portal` -> `bookings-grid.component.html`), se identifican las siguientes áreas de mejora de diseño y cumplimiento de directivas arquitectónicas de [AGENTS.md](file:///Users/jjsanquisb/Labs/spt-app-project/AGENTS.md):
1. **Uso de HTML nativo en lugar de componentes PrimeNG v18:**
   - La selección de fecha se realiza actualmente mediante un `<input type="date" pInputText ...>` plano del navegador, en lugar de utilizar el componente oficial de PrimeNG v18 `p-datepicker` (`DatePickerModule`).
   - Los botones de las franjas horarias de pista (`.slot-button`) y botones de cambio rápido de día contienen etiquetas `<button>` nativas sin la directiva obligatoria `pButton`.
2. **Textos hardcodeados en plantilla:**
   - Botones "Hoy" y "Mañana" tienen texto hardcodeado en español sin consumir el diccionario de internacionalización (`ngx-translate`).
3. **Falta de vista tipo Calendario / Matriz Horaria (Alternativa C):**
   - Actualmente las pistas se listan como tarjetas individuales independientes apiladas. Para que un usuario o jugador pueda comparar de un vistazo la disponibilidad simultánea de todas las pistas del centro a lo largo de las horas del día (como en Playtomic, Google Calendar o Matchpoint), se necesita una **matriz horaria sincronizada (Cuadrante de Calendario)**, permitiendo alternar cómodamente entre el cuadrante de calendario y la vista de tarjetas.

---

## 2. Solución Propuesta

1. **Reemplazo del selector de fecha por `p-datepicker` de PrimeNG v18:**
   - Integrar `DatePickerModule` de `'primeng/datepicker'` en `BookingsGridComponent`.
   - Reemplazar el `<input type="date">` por `<p-datepicker>` con selector de icono integrado (`[showIcon]="true"`), restricción de fecha mínima a hoy (`[minDate]="today"`), formato localizado (`dateFormat="dd/mm/yy"`) y enlace reactivo bidireccional / eventos.

2. **Sustitución de elementos nativos por directivas PrimeNG y eliminación de textos hardcodeados:**
   - Sustituir todos los botones nativos por botones con directiva `pButton` (`severity`, `[outlined]`, etc.).
   - Reemplazar los textos literales por claves estructuradas en `es.json` (`COMMON.TODAY`, `COMMON.TOMORROW`, `PORTAL.BOOKINGS.VIEW_GRID`, etc.).

3. **Implementación de la Vista Cuadrante Tipo Calendario (Alternativa C):**
   - Incorporar selector de modo de vista con `p-selectbutton` o botones de switch (`pButton` con iconos de cuadrícula/calendario y lista).
   - **Vista Matriz Horaria (Cuadrante Calendario):**
     - Cabecera horizontal de columnas con las pistas filtradas (nombre, deporte, icono, iluminación).
     - Eje vertical de filas con las franjas horarias consolidadas (`08:00 - 09:30`, `09:30 - 11:00`, etc.).
     - Celdas interactivas con `pButton` que reflejan el estado del slot: disponible con precio y resaltado para hora punta, ocupado o bloqueado.
   - **Vista Lista por Pista:** Mantiene la vista adaptativa por tarjetas para pantallas móviles o usuarios que prefieran navegar pista por pista.

---

## 3. Criterios de Aceptación (CA)

- [x] **CA-01:** El selector de fecha utiliza exclusivamente el componente `p-datepicker` de PrimeNG v18, con formato `dd/mm/yy`, icono de calendario y validación de fecha mínima.
- [x] **CA-02:** Los botones de "Hoy" y "Mañana" consumen traducciones `ngx-translate` y usan la directiva `pButton`.
- [x] **CA-03:** Todas las celdas de franjas horarias (slots) en la vista de disponibilidad utilizan la directiva `pButton` y estilos semánticos de PrimeNG.
- [x] **CA-04:** Se implementa la vista de matriz horaria / cuadrante de pistas sincronizada por horas y pistas del club.
- [x] **CA-05:** Se permite alternar fluidamente entre la vista de cuadrante tipo calendario y la vista de lista/tarjetas.
- [x] **CA-06:** Se mantienen intactos los contratos OpenAPI y endpoints de la API (`facilitiesControllerGetAvailability`, `bookingsControllerCreate`).
- [x] **CA-07:** La suite de pruebas unitarias (`npm test`) y la compilación (`npm run build:all`) se ejecutan con 100% de éxito y sin advertencias.

---

## 4. Impacto Estimado

- **Backend:** 0 archivos (Sin impacto en backend).
- **Base de datos:** 0 cambios. Riesgo NULO.
- **Frontend:** `BookingsGridComponent` (`bookings-grid.component.ts`, `html`, `scss`, `spec.ts`) y diccionario `es.json`.
- **Riesgo:** 🟢 Bajo (Mejora visual y funcional de la experiencia de usuario en reservas).
