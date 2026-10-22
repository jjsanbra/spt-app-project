import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthService, NotificationService, getAuthControllerRegisterResponseMock } from '@core';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: any;
  let notifySpy: any;
  let router: Router;

  beforeEach(async () => {
    vi.useFakeTimers();
    authServiceSpy = {
      register: vi.fn(),
    };
    notifySpy = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: NotificationService, useValue: notifySpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe crear el componente con campos obligatorios vacíos', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm.valid).toBeFalsy();
    expect(component.registerForm.get('firstName')?.hasError('required')).toBeTruthy();
    expect(component.registerForm.get('lastName')?.hasError('required')).toBeTruthy();
    expect(component.registerForm.get('email')?.hasError('required')).toBeTruthy();
    expect(component.registerForm.get('password')?.hasError('required')).toBeTruthy();
  });

  it('debe validar la longitud mínima de contraseña (8 caracteres)', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });

  it('debe detectar contraseñas no coincidentes', () => {
    component.registerForm.patchValue({
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
  });

  it('debe registrar un usuario exitosamente usando el mock de Orval y redirigir', () => {
    const mockRegisterResponse = getAuthControllerRegisterResponseMock({
      user: {
        id: 'user-reg-1',
        email: 'nuevo@spt.com',
        firstName: 'Rafael',
        lastName: 'Nadal',
        isSuperAdmin: false,
        memberships: [],
      },
    });

    authServiceSpy.register.mockReturnValue(of(mockRegisterResponse));

    component.registerForm.setValue({
      firstName: 'Rafael',
      lastName: 'Nadal',
      email: 'nuevo@spt.com',
      phone: '+34600112233',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(component.registerForm.valid).toBeTruthy();

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      firstName: 'Rafael',
      lastName: 'Nadal',
      email: 'nuevo@spt.com',
      phone: '+34600112233',
      password: 'Password123!',
    });

    expect(notifySpy.success).toHaveBeenCalledWith('AUTH.REGISTER_SUCCESS', 'APP.NAME');
    vi.advanceTimersByTime(1100);
    expect(router.navigate).toHaveBeenCalledWith(['/portal']);
  });

  it('debe mostrar error cuando el email ya existe (409 Conflict)', () => {
    authServiceSpy.register.mockReturnValue(
      throwError(() => ({ status: 409, message: 'Email already exists' })),
    );

    component.registerForm.setValue({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'existente@spt.com',
      phone: '',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(notifySpy.error).toHaveBeenCalledWith('AUTH.ERRORS.EMAIL_EXISTS', 'ERRORS.GENERIC');
    expect(component.loading).toBeFalsy();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
