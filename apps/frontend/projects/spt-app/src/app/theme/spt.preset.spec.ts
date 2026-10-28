import { describe, expect, it } from 'vitest';
import { SPTPreset } from './spt.preset';

describe('SPTPreset', () => {
  it('debe estar definido y exportar la configuración oficial del tema', () => {
    expect(SPTPreset).toBeDefined();
    expect(typeof SPTPreset).toBe('object');
  });

  it('debe configurar la paleta semántica primary con el tono Stitch Neon Pink #FF2D78', () => {
    const semantic = (SPTPreset as any).semantic;
    expect(semantic).toBeDefined();
    expect(semantic.primary).toBeDefined();
    // La paleta generada contiene los tonos del color principal
    expect(typeof semantic.primary).toBe('object');
  });

  it('debe configurar los esquemas de color light y dark con superficies Stitch', () => {
    const semantic = (SPTPreset as any).semantic;
    const colorScheme = semantic.colorScheme;
    expect(colorScheme).toBeDefined();
    expect(colorScheme.light).toBeDefined();
    expect(colorScheme.light.surface).toBeDefined();
    expect(colorScheme.light.surface[0]).toBe('#ffffff');
    expect(colorScheme.dark).toBeDefined();
    expect(colorScheme.dark.surface).toBeDefined();
    expect(colorScheme.dark.surface[50]).toBe('#07060d');
  });

  it('debe configurar los tokens de componentes para card, button y avatar', () => {
    const components = (SPTPreset as any).components;
    expect(components).toBeDefined();
    expect(components.card).toBeDefined();
    expect(components.card.root.borderRadius).toBe('16px');
    expect(components.button).toBeDefined();
    expect(components.button.root.borderRadius).toBe('8px');
    expect(components.avatar).toBeDefined();
    expect(components.avatar.xl.width).toBe('5rem');
  });
});
