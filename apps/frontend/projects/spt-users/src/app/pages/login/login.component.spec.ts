import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuthService, getAuthControllerLoginResponseMock } from '@core';
import { LoginComponent, REMEMBERED_EMAIL_KEY } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: any;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    authServiceSpy = {
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        MessageService,
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe crear el componente e inicializar el formulario inválido con rememberMe en false por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.valid).toBeFalsy();
    expect(component.loginForm.get('email')?.hasError('required')).toBeTruthy();
    expect(component.loginForm.get('password')?.hasError('required')).toBeTruthy();
    expect(component.loginForm.get('rememberMe')?.value).toBeFalsy();
  });

  it('debe precargar el email y marcar rememberMe si existe un usuario recordado en localStorage', () => {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, 'recordado@spt.com');

    const fixtureWithRemembered = TestBed.createComponent(LoginComponent);
    const compWithRemembered = fixtureWithRemembered.componentInstance;
    fixtureWithRemembered.detectChanges();

    expect(compWithRemembered.loginForm.get('email')?.value).toBe('recordado@spt.com');
    expect(compWithRemembered.loginForm.get('rememberMe')?.value).toBeTruthy();
  });

  it('debe validar el formato correcto de email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('correo-no-valido');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('usuario@spt.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('debe guardar el email en localStorage si rememberMe es true al iniciar sesión', () => {
    const mockAuthResponse = getAuthControllerLoginResponseMock();
    authServiceSpy.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'guardar@spt.com',
      password: 'Password123!',
      rememberMe: true,
    });

    component.onSubmit();

    expect(localStorage.getItem(REMEMBERED_EMAIL_KEY)).toBe('guardar@spt.com');
  });

  it('debe eliminar el email de localStorage si rememberMe es false al iniciar sesión', () => {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, 'antiguo@spt.com');
    const mockAuthResponse = getAuthControllerLoginResponseMock();
    authServiceSpy.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'otro@spt.com',
      password: 'Password123!',
      rememberMe: false,
    });

    component.onSubmit();

    expect(localStorage.getItem(REMEMBERED_EMAIL_KEY)).toBeNull();
  });

  it('debe iniciar sesión exitosamente usando el mock de Orval y redirigir', () => {
    const mockAuthResponse = getAuthControllerLoginResponseMock({
      user: {
        id: 'user-test-1',
        email: 'admin@spt.com',
        firstName: 'Carlos',
        lastName: 'Alcaraz',
        isSuperAdmin: false,
        memberships: [
          {
            clubId: 'club-1',
            clubName: 'Club Padel Madrid',
            clubSlug: 'club-padel-madrid',
            role: 'ADMIN',
            walletBalance: 150.0,
          },
        ],
      },
    });

    authServiceSpy.login.mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'admin@spt.com',
      password: 'Password123!',
      rememberMe: false,
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'admin@spt.com',
      password: 'Password123!',
    });
    expect(component.loading).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('debe manejar error 401 de credenciales incorrectas', () => {
    authServiceSpy.login.mockReturnValue(
      throwError(() => ({ status: 401, message: 'Unauthorized' })),
    );

    component.loginForm.setValue({
      email: 'erroneo@spt.com',
      password: 'BadPassword',
      rememberMe: false,
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(component.loading).toBeFalsy();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
