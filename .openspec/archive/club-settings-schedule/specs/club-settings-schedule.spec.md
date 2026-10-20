# Especificación Delta: Configuración y Horarios del Club

## 1. Reglas de Negocio

### RN-1: Aislamiento Multi-Tenant Estricto
La configuración del club solo puede ser consultada o modificada para el `club_id` activo del tenant autenticado extraído de la cabecera `x-tenant-id`.

### RN-2: Validación de Coherencia de Horarios
- `openingHour` debe estar en el rango de 0 a 23.
- `closingHour` debe estar en el rango de 1 a 24.
- `openingHour` debe ser estrictamente menor que `closingHour`. Si la combinación de la petición resulta en `openingHour >= closingHour`, el backend debe responder con un error `400 Bad Request`.

### RN-3: Modos de Pago
Los modos de pago soportados son los definidos por el enum `PaymentMode`:
- `PRESENTIAL`: Pago presencial en recepción al llegar al centro (Modalidad A del plan).
- `ONLINE`: Pago online obligatorio por pasarela para confirmar reserva (Modalidad B).
- `HYBRID`: El jugador puede elegir entre pagar online en la app o abonar en recepción.

---

## 2. Casos de Uso

### CU-1: Consultar Ajustes del Club
- **Actor:** Administrador (`OWNER` o `ADMIN`).
- **Flujo:**
  1. El cliente solicita `GET /api/v1/clubs/settings`.
  2. El servidor busca el club por `clubId`.
  3. Devuelve los datos generales, horarios, modalidad de pago y datos de contacto.

### CU-2: Actualizar Ajustes y Horarios
- **Actor:** Administrador (`OWNER` o `ADMIN`).
- **Flujo:**
  1. El cliente envía `PATCH /api/v1/clubs/settings` con los campos a modificar.
  2. El servidor valida la coherencia horaria y los rangos numéricos.
  3. Actualiza el registro del club en la base de datos.
  4. Devuelve el club actualizado y emite notificación de éxito en la interfaz.
