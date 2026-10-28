# Diseño Técnico: Corrección de Checkboxes y Espaciados de Registro

## 1. Arquitectura de Estilos y Tokens de Diseño

### 1.1 Tokens Semánticos (`_variables.scss`)
Se declaran tokens invariantes y de tema para PrimeNG Checkbox:
```scss
/* PrimeNG Checkbox Geometrics */
--p-checkbox-width: 1.25rem;
--p-checkbox-height: 1.25rem;
--p-checkbox-border-radius: var(--radius-xs);
--p-checkbox-icon-size: 0.875rem;
--p-checkbox-transition-duration: 0.2s;

/* Colores */
--p-checkbox-background: var(--surface-pure);
--p-checkbox-border-color: var(--border-input);
--p-checkbox-hover-border-color: var(--primary-color);
--p-checkbox-focus-border-color: var(--primary-color);
--p-checkbox-checked-background: var(--primary-color);
--p-checkbox-checked-border-color: var(--primary-color);
--p-checkbox-checked-color: #FFFFFF;
```

### 1.2 Reglas CSS Universales (`_forms.scss`)
Garantizan el layout dimensional ante cualquier configuración de microfrontend:
```scss
p-checkbox,
.p-checkbox {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  position: relative;
  user-select: none;
  vertical-align: middle;

  .p-checkbox-box {
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-pure);
    border: 1.5px solid var(--border-input);
    border-radius: var(--radius-xs);
    transition: all 0.2s ease;
  }
}
```

### 1.3 Contenedor de Checkbox con Etiqueta (`.form-group-checkbox`)
En `login.component.scss` y `_forms.scss`:
```scss
.form-group-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;

  .checkbox-label {
    font-size: var(--font-size-sm);
    color: var(--text-color);
    cursor: pointer;
    user-select: none;
    line-height: 1;
  }
}
```

### 1.4 Espaciado en Registro (`register.component.scss`)
```scss
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg); // 20px
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-base); // 16px
}

.form-actions {
  margin-top: var(--spacing-md);
}
```

## 2. Evaluación de Riesgo en Base de Datos
- **Impacto en BD:** Ninguno. Los cambios son 100% de estilos SCSS y presentación visual en el frontend.
- **Riesgo:** 0 / Nulo. No se tocan esquemas Prisma ni migraciones.
