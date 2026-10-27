import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, NavigationEnd, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService, UserSummaryDto } from '@core';
import { RealtimeNotificationsService } from './core/services/realtime-notifications.service';
import { App } from './app';

describe('App', () => {
  let authServiceMock: {
    currentUser: ReturnType<typeof signal<UserSummaryDto | null>>;
    activeClub: ReturnType<typeof signal<any>>;
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    isSuperAdmin: ReturnType<typeof signal<boolean>>;
    isOwnerOrSuperAdmin: ReturnType<typeof signal<boolean>>;
    getAccessToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let realtimeNotificationsMock: {
    notifications: ReturnType<typeof signal<any[]>>;
    unreadCount: ReturnType<typeof signal<number>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    loadNotifications: ReturnType<typeof vi.fn>;
    markAsRead: ReturnType<typeof vi.fn>;
    markAllAsRead: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal<UserSummaryDto | null>(null),
      activeClub: signal<any>(null),
      isAuthenticated: signal<boolean>(false),
      isSuperAdmin: signal<boolean>(false),
      isOwnerOrSuperAdmin: signal<boolean>(false),
      getAccessToken: vi.fn().mockReturnValue('mock-token'),
      logout: vi.fn(),
    };

    realtimeNotificationsMock = {
      notifications: signal([]),
      unreadCount: signal(0),
      isLoading: signal(false),
      loadNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        MessageService,
        ConfirmationService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: RealtimeNotificationsService, useValue: realtimeNotificationsMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render brand and router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });


  describe('hasAdminRole computed', () => {
    it('should return false when user is not logged in', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      authServiceMock.currentUser.set(null);
      expect(app.hasAdminRole()).toBe(false);
    });

    it('should return true when user is superAdmin', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      authServiceMock.currentUser.set({
        id: 'u1',
        email: 'admin@spt.com',
        firstName: 'Super',
        lastName: 'Admin',
        isSuperAdmin: true,
      } as UserSummaryDto);
      expect(app.hasAdminRole()).toBe(true);
    });

    it('should return true when user has ADMIN, OWNER or STAFF membership', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;

      authServiceMock.currentUser.set({
        id: 'u2',
        email: 'staff@spt.com',
        firstName: 'Staff',
        lastName: 'User',
        isSuperAdmin: false,
        memberships: [{ clubId: 'c1', role: 'STAFF' as any }],
      } as any);
      expect(app.hasAdminRole()).toBe(true);

      authServiceMock.currentUser.set({
        id: 'u3',
        email: 'owner@spt.com',
        firstName: 'Owner',
        lastName: 'User',
        isSuperAdmin: false,
        memberships: [{ clubId: 'c1', role: 'OWNER' as any }],
      } as any);
      expect(app.hasAdminRole()).toBe(true);

      authServiceMock.currentUser.set({
        id: 'u4',
        email: 'admin@spt.com',
        firstName: 'Admin',
        lastName: 'User',
        isSuperAdmin: false,
        memberships: [{ clubId: 'c1', role: 'ADMIN' as any }],
      } as any);
      expect(app.hasAdminRole()).toBe(true);
    });

    it('should return false when user only has MEMBER role or no memberships', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;

      authServiceMock.currentUser.set({
        id: 'u5',
        email: 'member@spt.com',
        firstName: 'Regular',
        lastName: 'Member',
        isSuperAdmin: false,
        memberships: [{ clubId: 'c1', role: 'MEMBER' as any }],
      } as any);
      expect(app.hasAdminRole()).toBe(false);

      authServiceMock.currentUser.set({
        id: 'u6',
        email: 'nomember@spt.com',
        firstName: 'No',
        lastName: 'Member',
        isSuperAdmin: false,
        memberships: [],
      } as any);
      expect(app.hasAdminRole()).toBe(false);
    });
  });

  describe('onLogout', () => {
    it('should call authService.logout and navigate to /login', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;

      app.onLogout();
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Template rendering authenticated vs guest', () => {
    it('should render active club badge, wallet, notification bell and logout when authenticated as regular member', () => {
      authServiceMock.isAuthenticated.set(true);
      authServiceMock.currentUser.set({
        id: 'u1',
        email: 'user@spt.com',
        firstName: 'Carlos',
        lastName: 'Pérez',
        isSuperAdmin: false,
      } as UserSummaryDto);
      authServiceMock.activeClub.set({
        clubId: 'c1',
        clubName: 'Club Central',
        role: 'MEMBER',
        walletBalance: 45.5,
      });
      authServiceMock.isSuperAdmin.set(false);
      authServiceMock.isOwnerOrSuperAdmin.set(false);

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.active-club-badge')).toBeTruthy();
      expect(el.querySelector('.user-wallet')?.textContent).toContain('45.5');
      expect(el.querySelector('app-notification-bell')).toBeTruthy();
    });

    it('should hide user-wallet in sidebar when authenticated as OWNER or SUPER_ADMIN', () => {
      authServiceMock.isAuthenticated.set(true);
      authServiceMock.currentUser.set({
        id: 'u-owner',
        email: 'owner@spt.com',
        firstName: 'Propietario',
        lastName: 'Club',
        isSuperAdmin: false,
      } as UserSummaryDto);
      authServiceMock.activeClub.set({
        clubId: 'c1',
        clubName: 'Club Central',
        role: 'OWNER',
        walletBalance: 0.0,
      });
      authServiceMock.isSuperAdmin.set(false);
      authServiceMock.isOwnerOrSuperAdmin.set(true);

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.active-club-badge')).toBeTruthy();
      expect(el.querySelector('.user-wallet')).toBeFalsy();
    });

    it('should render login and register buttons when not authenticated', () => {
      authServiceMock.isAuthenticated.set(false);
      authServiceMock.currentUser.set(null);
      authServiceMock.activeClub.set(null);

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.active-club-badge')).toBeFalsy();
      expect(el.querySelector('app-notification-bell')).toBeFalsy();
    });
  });

  describe('isAuthPage and layout chrome visibility', () => {
    it('should hide sidebar and topbar on /login and show floating theme toggle', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.currentUrl.set('/login');
      fixture.detectChanges();

      expect(app.isAuthPage()).toBe(true);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.app-sidebar')).toBeFalsy();
      expect(el.querySelector('.app-topbar')).toBeFalsy();
      expect(el.querySelector('.auth-theme-floating')).toBeTruthy();
      expect(el.querySelector('.auth-layout')).toBeTruthy();
      expect(el.querySelector('router-outlet')).toBeTruthy();
    });

    it('should hide sidebar and topbar on /register and with query params', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.currentUrl.set('/register?plan=pro');
      fixture.detectChanges();

      expect(app.isAuthPage()).toBe(true);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.app-sidebar')).toBeFalsy();
      expect(el.querySelector('.app-topbar')).toBeFalsy();
      expect(el.querySelector('.auth-theme-floating')).toBeTruthy();
    });

    it('should show sidebar and topbar on regular authenticated routes', () => {
      authServiceMock.isAuthenticated.set(true);
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.currentUrl.set('/portal');
      fixture.detectChanges();

      expect(app.isAuthPage()).toBe(false);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.app-sidebar')).toBeTruthy();
      expect(el.querySelector('.app-topbar')).toBeTruthy();
      expect(el.querySelector('.auth-theme-floating')).toBeFalsy();
      expect(el.querySelector('.auth-layout')).toBeFalsy();
    });
  });

  describe('canViewMatches computed & sidebar link visibility', () => {
    it('debe devolver false si no hay usuario autenticado', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      authServiceMock.currentUser.set(null);
      expect(app.canViewMatches()).toBe(false);
    });

    it('debe devolver false si el usuario es superadmin y no renderizar el enlace en el sidebar', () => {
      authServiceMock.isAuthenticated.set(true);
      authServiceMock.currentUser.set({
        id: 'u-super',
        email: 'superadmin@spt-app.local',
        firstName: 'Super',
        lastName: 'Admin',
        isSuperAdmin: true,
        memberships: [],
      });
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      expect(app.canViewMatches()).toBe(false);
      const el = fixture.nativeElement as HTMLElement;
      const matchesLink = el.querySelector('a[routerLink="/portal/matches"]');
      expect(matchesLink).toBeFalsy();
    });

    it('debe devolver false si el usuario es administrador o dueño del club activo', () => {
      authServiceMock.isAuthenticated.set(true);
      authServiceMock.activeClub.set({ clubId: 'c1', clubName: 'Club Central', clubSlug: 'club-central', role: 'ADMIN', walletBalance: 0 });
      authServiceMock.currentUser.set({
        id: 'u-admin',
        email: 'admin@centralpadel.local',
        firstName: 'Admin',
        lastName: 'Club',
        isSuperAdmin: false,
        memberships: [{ clubId: 'c1', clubName: 'Club Central', clubSlug: 'club-central', role: 'ADMIN', walletBalance: 0 } as any],
      } as any);
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      expect(app.canViewMatches()).toBe(false);
      const el = fixture.nativeElement as HTMLElement;
      const matchesLink = el.querySelector('a[routerLink="/portal/matches"]');
      expect(matchesLink).toBeFalsy();
    });

    it('debe devolver true para un socio normal y renderizar el enlace en el sidebar', () => {
      authServiceMock.isAuthenticated.set(true);
      authServiceMock.activeClub.set({ clubId: 'c1', clubName: 'Club Central', clubSlug: 'club-central', role: 'MEMBER', walletBalance: 50 });
      authServiceMock.currentUser.set({
        id: 'u-member',
        email: 'socio@spt-app.local',
        firstName: 'Socio',
        lastName: 'Jugador',
        isSuperAdmin: false,
        memberships: [{ clubId: 'c1', clubName: 'Club Central', clubSlug: 'club-central', role: 'MEMBER', walletBalance: 50 } as any],
      } as any);
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      fixture.detectChanges();

      expect(app.canViewMatches()).toBe(true);
      const el = fixture.nativeElement as HTMLElement;
      const matchesLink = el.querySelector('a[routerLink="/portal/matches"]');
      expect(matchesLink).toBeTruthy();
    });

    it('debe devolver false si el usuario tiene membresía de OWNER en otro club', () => {
      authServiceMock.isAuthenticated.set(true);
      authServiceMock.activeClub.set({ clubId: 'c2', clubName: 'Otro Club', role: 'MEMBER' });
      authServiceMock.currentUser.set({
        id: 'u-owner-other',
        email: 'owner@club.local',
        firstName: 'Owner',
        lastName: 'Club',
        isSuperAdmin: false,
        memberships: [{ clubId: 'c1', clubName: 'Club 1', role: 'OWNER' } as any],
      } as any);
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      expect(app.canViewMatches()).toBe(false);
    });
  });

  describe('sidebar and navigation methods', () => {
    it('toggleSidebar should toggle sidebarOpen state', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const initial = app.sidebarOpen();
      app.toggleSidebar();
      expect(app.sidebarOpen()).toBe(!initial);
      app.toggleSidebar();
      expect(app.sidebarOpen()).toBe(initial);
    });

    it('closeSidebar should close sidebar only on mobile', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.isDesktop.set(false);
      app.sidebarOpen.set(true);
      app.closeSidebar();
      expect(app.sidebarOpen()).toBe(false);

      app.isDesktop.set(true);
      app.sidebarOpen.set(true);
      app.closeSidebar();
      expect(app.sidebarOpen()).toBe(true);
    });

    it('window resize should update isDesktop and sidebarOpen', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
      expect(app.isDesktop()).toBe(false);

      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
      window.dispatchEvent(new Event('resize'));
      expect(app.isDesktop()).toBe(true);
    });

    it('navigation should update currentUrl and close sidebar on mobile', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.isDesktop.set(false);
      app.sidebarOpen.set(true);

      (router as any).events.next(new (class extends NavigationEnd {
        constructor() {
          super(1, '/portal/activity', '/portal/activity');
        }
      })());

      expect(app.currentUrl()).toBe('/portal/activity');
      expect(app.sidebarOpen()).toBe(false);
    });
  });
});


