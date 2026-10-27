import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService, ThemeService } from '@core';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs/operators';
import { NotificationBellComponent } from './layout/notification-bell/notification-bell.component';

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
    SidebarModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    NotificationBellComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isDesktop = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );


  readonly sidebarOpen = signal<boolean>(this.isDesktop());
  readonly currentUrl = signal<string>(this.router.url || '');

  readonly isAuthPage = computed(() => {
    const url = this.currentUrl();
    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl === '/login' || cleanUrl === '/register';
  });

  readonly hasAdminRole = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.memberships?.some(
      (m) => m.role === 'ADMIN' || m.role === 'OWNER' || m.role === 'STAFF',
    ) ?? false;
  });

  readonly canViewMatches = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.isSuperAdmin) return false;

    const activeRole = this.authService.activeClub()?.role;
    if (activeRole === 'OWNER' || activeRole === 'ADMIN') return false;

    const isClubAdmin = user.memberships?.some(
      (m) => m.role === 'OWNER' || m.role === 'ADMIN',
    );
    if (isClubAdmin) return false;

    return true;
  });

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        const desktop = window.innerWidth >= 1024;
        if (desktop !== this.isDesktop()) {

          this.isDesktop.set(desktop);
          this.sidebarOpen.set(desktop);
        }
      });
    }

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (!this.isDesktop()) {
          this.sidebarOpen.set(false);
        }
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    if (!this.isDesktop()) {
      this.sidebarOpen.set(false);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

