# Delta de Especificación: bookings-calendar-grid-refactor

**Fecha:** 2026-10-22  
**Módulo:** `spt-portal`  
**Alcance:** Selector DatePicker de PrimeNG v18 y vista matriz tipo calendario para reservas de pistas.  

---

## 1. Reglas de Negocio y Requisitos de UI

### RN-BOOKINGS-DATEPICKER-01: Componente DatePicker de PrimeNG v18
- El selector de fecha en la vista de disponibilidad debe ser exclusivamente una instancia de `p-datepicker` (`DatePickerModule`).
- Queda terminantemente prohibido el uso de `<input type="date">` o elementos HTML de formulario sin directivas de PrimeNG.
- El DatePicker debe mostrar icono de calendario (`[showIcon]="true"`), modo input (`[iconDisplay]="'input'"`), formato `dd/mm/yy` y restringir la fecha mínima al día actual (`[minDate]="today"`).

### RN-BOOKINGS-CALENDAR-MATRIX-02: Vista Cuadrante / Matriz Horaria Tipo Calendario
- La vista de disponibilidad ofrecerá una modalidad de visualización en **Cuadrante de Calendario (Matriz Horaria)**:
  - Columnas: Pistas disponibles que coincidan con el filtro de deporte.
  - Filas: Franjas horarias consolidadas del centro deportivo.
  - Celdas: Cada cruce representará el slot de la pista en esa franja.
- Las celdas libres deben mostrar el precio y permitir interacción mediante clic con `pButton`, abriendo el modal de confirmación existente.
- Las celdas ocupadas o bloqueadas deben mostrarse desactivadas con indicación visual clara de su estado.
- Se mantendrá disponible un selector para alternar entre la vista de cuadrante de calendario y la vista de tarjetas.

### RN-BOOKINGS-PBUTTON-03: Botones y Textos Semánticos
- Todos los botones interactivos (cambio rápido "Hoy"/"Mañana", ranuras horarias de slots, selector de vista) deben implementar obligatoriamente la directiva `pButton`.
- Ningún texto visual de la plantilla puede estar hardcodeado; todos se consumirán mediante la tubería `translate`.
