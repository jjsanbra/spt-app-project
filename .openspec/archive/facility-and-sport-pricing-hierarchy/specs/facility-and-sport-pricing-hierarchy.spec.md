# Especificación Funcional: Jerarquía de Tarifas por Deporte y Pista

**ID del Cambio:** `facility-and-sport-pricing-hierarchy`
**Estado:** Activo

---

## 1. Reglas de Negocio de Tarificación (RN)

### RN-1: Ámbitos de Aplicación de una Regla de Tarifa
Una regla de tarifa (`PricingRule`) puede tener tres niveles de cobertura:
1. **Ámbito Pista Específica (`FACILITY`):** La regla define `facilityId = <ID_PISTA>` y opcionalmente `sportType = null`. Aplica única y exclusivamente a esa pista concreta.
2. **Ámbito Por Deporte (`SPORT`):** La regla define `sportType = <DEPORTE>` y `facilityId = null`. Aplica a todas las pistas del club asociadas a ese deporte que no cuenten con una regla específica de pista.
3. **Ámbito General de Club (`GLOBAL`):** La regla define `facilityId = null` y `sportType = null`. Aplica a todas las pistas que no tengan una regla por deporte ni por pista.

### RN-2: Resolución Jerárquica del Precio de una Reserva
Dado un intento de reserva en una pista $F$ de deporte $S$, en fecha $D$ (día de la semana $w$) y franja horaria $[h_{inicio}, h_{fin})$:
1. Se buscan las reglas coincidentes en franja horaria y día de la semana.
2. Orden de resolución:
   $$\text{Regla coincidente con } facilityId == F.id$$
   $$\text{En su defecto: Regla coincidente con } sportType == F.sportType \text{ y } facilityId == null$$
   $$\text{En su defecto: Regla coincidente con } facilityId == null \text{ y } sportType == null$$
   $$\text{En su defecto: Precios por defecto de contingencia (16.00 € socio / 22.00 € invitado)}$$
3. Entre reglas del mismo nivel jerárquico, prevalece la de mayor `priority` numérico.

### RN-3: Configuración Bidireccional
- Desde el módulo de **Tarifas**, el usuario puede crear reglas para cualquier ámbito.
- Desde el módulo de **Pistas**, el usuario puede consultar el precio base vigente resultante de la jerarquía y, opcionalmente, asignar o sobreescribir un precio específico para esa pista concreta con 1 clic.

---

## 2. Casos de Uso (CU)

### CU-1: Administrador crea tarifa por Deporte
- **Actor:** Administrador del Club.
- **Acción:** Crea la tarifa "Pádel Estándar" seleccionando Ámbito "Por Deporte" -> Pádel, con precio Socio 20€ / Invitado 28€.
- **Resultado:** Todas las pistas de Pádel del club adoptan automáticamente estos precios, sin afectar a las pistas de Tenis ni requerir asignar pista a pista.

### CU-2: Administrador personaliza precio de una Pista Premium
- **Actor:** Administrador del Club.
- **Acción:** Para la "Pista 1 Central", crea o ajusta una tarifa con Ámbito "Pista Específica" (ej. 24€ socio / 32€ invitado).
- **Resultado:** La Pista 1 Central adopta el precio premium, mientras que el resto de pistas de pádel mantienen la tarifa de deporte general.

### CU-3: Administrador visualiza tarifas resueltas en lista de pistas
- **Actor:** Administrador del Club.
- **Acción:** Accede a `/admin/facilities`.
- **Resultado:** En la columna "Tarifa / Precio Base" visualiza:
  - Para Pista 1 Central: `24,00 € / 32,00 €` con badge verde `Pista Específica`.
  - Para Pista 2: `20,00 € / 28,00 €` con badge azul `Pádel`.
