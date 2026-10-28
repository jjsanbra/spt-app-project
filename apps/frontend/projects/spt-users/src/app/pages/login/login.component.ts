import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService, NotificationService } from '@core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';

export const REMEMBERED_EMAIL_KEY = 'spt_remembered_email';

export interface QuickLoginUser {
  labelKey: string;
  roleBadgeKey: string;
  email: string;
  password: string;
  icon: string;
  severity: 'danger' | 'warn' | 'success' | 'info';
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    DividerModule,
    TagModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  readonly isLocalEnvironment =
    isDevMode() ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

  readonly quickLoginUsers: QuickLoginUser[] = [
    {
      labelKey: 'AUTH.DEMO_USERS.SUPERADMIN_NAME',
      roleBadgeKey: 'AUTH.DEMO_USERS.SUPERADMIN_ROLE',
      email: 'superadmin@spt-app.local',
      password: 'SuperAdmin123!',
      icon: 'pi pi-shield',
      severity: 'danger',
    },
    {
      labelKey: 'AUTH.DEMO_USERS.ADMIN_NAME',
      roleBadgeKey: 'AUTH.DEMO_USERS.ADMIN_ROLE',
      email: 'admin@centralpadel.local',
      password: 'ClubAdmin123!',
      icon: 'pi pi-building',
      severity: 'warn',
    },
    {
      labelKey: 'AUTH.DEMO_USERS.MEMBER_NAME',
      roleBadgeKey: 'AUTH.DEMO_USERS.MEMBER_ROLE',
      email: 'socio@spt-app.local',
      password: 'Player123!',
      icon: 'pi pi-user',
      severity: 'success',
    },
    {
      labelKey: 'AUTH.DEMO_USERS.GUEST_NAME',
      roleBadgeKey: 'AUTH.DEMO_USERS.GUEST_ROLE',
      email: 'invitado@spt-app.local',
      password: 'Player123!',
      icon: 'pi pi-users',
      severity: 'info',
    },
  ];

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  loading = false;

  fillAndLogin(user: QuickLoginUser): void {
    this.loginForm.patchValue({
      email: user.email,
      password: user.password,
    });
    this.onSubmit();
  }

  ngOnInit(): void {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true,
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.notify.success(
          `${this.translate.instant('AUTH.LOGIN')}: ${res.user.firstName}`,
          'APP.NAME'
        );

        // Redirección inteligente: si es admin de club, al panel admin; si no, al portal de reservas
        const hasAdminRole = res.user.memberships?.some(
          (m) => m.role === 'ADMIN' || m.role === 'OWNER',
        );

        if (res.user.isSuperAdmin || hasAdminRole) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/portal']);
        }
      },
      error: (err) => {
        this.loading = false;
        const detailKey =
          err.status === 401
            ? 'AUTH.ERRORS.INVALID_CREDENTIALS'
            : 'ERRORS.GENERIC';

        this.notify.error(detailKey, 'ERRORS.UNAUTHORIZED');
      },
    });
  }
}
