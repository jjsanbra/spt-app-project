import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService, ClubMembershipSummaryDto, NotificationService, ThemeService } from '@core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule, SidebarTrigger } from 'primeng/sidebar';
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
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    ButtonModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SidebarModule,
    SidebarTrigger,
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
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  readonly isDesktop = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );

  readonly sidebarOpen = signal<boolean>(this.isDesktop());
  readonly currentUrl = signal<string>(this.router.url || '');
  readonly changeClubDialogVisible = signal<boolean>(false);
  readonly clubSearchTerm = signal<string>('');

  readonly filteredMemberships = computed(() => {
    const term = this.clubSearchTerm().trim().toLowerCase();
    const memberships = this.authService.userMemberships();
    if (!term) return memberships;
    return memberships.filter(
      (m) =>
        m.clubName.toLowerCase().includes(term) ||
        (m.clubCity && m.clubCity.toLowerCase().includes(term)),
    );
  });

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

  openChangeClubDialog(): void {
    this.clubSearchTerm.set('');
    this.changeClubDialogVisible.set(true);
  }

  onSelectClub(club: ClubMembershipSummaryDto): void {
    if (this.authService.activeClub()?.clubId === club.clubId) {
      this.changeClubDialogVisible.set(false);
      return;
    }

    this.authService.setActiveClub(club);
    const successMsg = this.translate.instant('USERS.CLUB_CHANGED_SUCCESS');
    this.notify.success(`${successMsg}: ${club.clubName}`);
    this.changeClubDialogVisible.set(false);

    // Salvaguarda: si estamos en /admin/* y en el nuevo club no tiene permisos de admin, redirigir a /portal
    const currentUrl = this.currentUrl();
    const isAdminRoute = currentUrl.startsWith('/admin');
    const hasAdminInNewClub =
      club.role === 'OWNER' ||
      club.role === 'ADMIN' ||
      club.role === 'STAFF' ||
      this.authService.isSuperAdmin();

    if (isAdminRoute && !hasAdminInNewClub) {
      this.router.navigate(['/portal']);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

