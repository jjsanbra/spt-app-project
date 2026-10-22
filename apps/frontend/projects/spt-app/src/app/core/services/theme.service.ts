import { Injectable, computed, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'spt-theme';

  readonly currentTheme = signal<AppTheme>(this.getInitialTheme());
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    this.persistTheme(theme);
  }

  private getInitialTheme(): AppTheme {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    try {
      const stored = window.localStorage.getItem(this.THEME_STORAGE_KEY) as AppTheme | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {
      // Fallback si localStorage no está accesible
    }

    return 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }

  private persistTheme(theme: AppTheme): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    } catch {
      // Ignorar errores de almacenamiento restringido
    }
  }
}
