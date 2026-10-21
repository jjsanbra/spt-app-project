import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
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
    it('should render active club badge, wallet, notification bell and logout when authenticated', () => {
      authServiceMock.isAuthenticated.set(true);
      authServiceMock.currentUser.set({
        id: 'u1',
        email: 'user@spt.com',
        firstName: 'Carlos',
        lastName: 'Pérez',
        isSuperAdmin: true,
      } as UserSummaryDto);
      authServiceMock.activeClub.set({
        clubId: 'c1',
        clubName: 'Club Central',
        role: 'OWNER',
        walletBalance: 45.5,
      });
      authServiceMock.isSuperAdmin.set(true);

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.active-club-badge')).toBeTruthy();
      expect(el.querySelector('.user-wallet')?.textContent).toContain('45.5');
      expect(el.querySelector('app-notification-bell')).toBeTruthy();
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
});
