import { definePreset, palette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * SPTPreset — Tema oficial de PrimeNG para SPT App (Stitch Sports Club).
 * Define la identidad visual oficial con la paleta Stitch Neon Pink (#FF2D78)
 * y las escalas de superficie sin sobreescribir la geometría ni los tokens internos de formulario de Aura.
 */
export const SPTPreset = definePreset(Aura, {
  semantic: {
    primary: palette('#FF2D78') as Record<string, string>,
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#07060d',
          100: '#0b0a14',
          200: '#141326',
          300: '#1c1a32',
          400: '#282545',
          500: '#38345c',
          600: '#64748b',
          700: '#94a3b8',
          800: '#e2e8f0',
          900: '#f8fafc',
          950: '#ffffff',
        },
      },
    },
  },
});
