import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hasAdminRole = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.memberships?.some(
      (m) => m.role === 'ADMIN' || m.role === 'OWNER' || m.role === 'STAFF',
    ) ?? false;
  });

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
