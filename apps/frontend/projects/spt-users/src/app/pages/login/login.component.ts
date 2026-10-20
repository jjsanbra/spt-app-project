import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FloatLabelModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('APP.NAME'),
          detail: `${this.translate.instant('AUTH.LOGIN')}: ${res.user.firstName}`,
        });

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
        const detail =
          err.status === 401
            ? this.translate.instant('AUTH.ERRORS.INVALID_CREDENTIALS')
            : this.translate.instant('ERRORS.GENERIC');

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERRORS.UNAUTHORIZED'),
          detail,
        });
      },
    });
  }
}
