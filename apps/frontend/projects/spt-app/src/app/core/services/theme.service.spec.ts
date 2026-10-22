import { TestBed } from '@angular/core/testing';
import { ThemeService, AppTheme } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  const STORAGE_KEY = 'spt-theme';

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark-theme', 'light-theme');

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark-theme', 'light-theme');
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe inicializarse en dark por defecto si no hay preferencia en localStorage', () => {
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
  });

  it('debe alternar de dark a light y viceversa con toggleTheme', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('debe fijar un tema explícito con setTheme', () => {
    service.setTheme('light');
    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');

    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('debe recuperar el tema persistido en localStorage al inicializarse', () => {
    window.localStorage.setItem(STORAGE_KEY, 'light');

    const newService = new ThemeService();
    expect(newService.currentTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
