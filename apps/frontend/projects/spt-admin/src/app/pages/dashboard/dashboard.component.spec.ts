import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ClubsDashboardService,
  SuperAdminClubsService,
  ThemeService,
  UserSummaryDto,
  getAuthControllerGetMeResponseMock,
  getClubDashboardControllerGetDashboardResponseMock,
  getClubDashboardControllerGetOperationalDashboardResponseMock,
  getSuperAdminClubsControllerGetOverviewResponseMock,
  getSuperAdminClubsControllerFindAllResponseMock,
} from '@core';
import { AdminDashboardComponent } from './dashboard.component';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  const mockAdminUser: UserSummaryDto = getAuthControllerGetMeResponseMock({
    id: 'admin-user-1',
    email: 'admin@centralpadel.local',
    firstName: 'Carlos',
    lastName: 'Director',
    isSuperAdmin: false,
    memberships: [
      {
        clubId: 'club-central',
        clubName: 'Club Deportivo Central Pádel & Tenis',
        clubSlug: 'central-padel',
        role: 'ADMIN',
        walletBalance: 0,
      },
    ],
  });

  const currentUserSignal = signal<UserSummaryDto | null>(mockAdminUser);
  const isSuperAdminSignal = signal<boolean>(false);
  const isClubAdminSignal = signal<boolean>(true);
  const isOwnerSignal = signal<boolean>(true);
  const isStaffSignal = signal<boolean>(false);
  const canViewFinancialsSignal = signal<boolean>(true);
  const canViewOperationalSignal = signal<boolean>(true);
  const activeClubSignal = signal<{ clubId: string; clubName: string; role: string } | null>({
    clubId: 'club-central',
    clubName: 'Club Deportivo Central Pádel & Tenis',
    role: 'ADMIN',
  });

  const authServiceMock = {
    currentUser: currentUserSignal,
    isSuperAdmin: isSuperAdminSignal,
    isClubAdmin: isClubAdminSignal,
    isOwner: isOwnerSignal,
    isStaff: isStaffSignal,
    canViewFinancials: canViewFinancialsSignal,
    canViewOperational: canViewOperationalSignal,
    activeClub: activeClubSignal,
  };

  const clubsDashboardServiceMock = {
    clubDashboardControllerGetDashboard: vi.fn(),
    clubDashboardControllerGetOperationalDashboard: vi.fn(),
  };

  const superAdminClubsServiceMock = {
    superAdminClubsControllerGetOverview: vi.fn(),
    superAdminClubsControllerFindAll: vi.fn(),
  };

  const themeServiceMock = {
    isDark: signal<boolean>(false),
  };

  const fullDashboardMock = getClubDashboardControllerGetDashboardResponseMock({
    today: {
      totalBookings: 18,
      occupancyPercent: 75.5,
      availableCourtsNext3Hours: 4,
      pendingPaymentsCount: 2,
      activeBlocksCount: 1,
    },
    month: {
      totalRevenue: 12450,
      revenueGrowthPercent: 12.5,
      occupancyPercent: 82.0,
      averageTicketPrice: 28.5,
      newMembersCount: 15,
    },
    revenueBySport: [
      { sportType: 'PADEL', label: 'Pádel', amount: 8500, percent: 68 },
      { sportType: 'TENNIS', label: 'Tenis', amount: 3950, percent: 32 },
    ],
    occupancyTrend: [
      { date: '2026-10-28', label: '28 Oct', bookingsCount: 18, occupancyPercent: 75 },
    ],
  });

  const operationalDashboardMock = getClubDashboardControllerGetOperationalDashboardResponseMock({
    today: {
      totalBookings: 12,
      occupancyPercent: 60.0,
      availableCourtsNext3Hours: 6,
      pendingPaymentsCount: 1,
      activeBlocksCount: 0,
    },
  });

  const superadminOverviewMock = getSuperAdminClubsControllerGetOverviewResponseMock({
    totalClubs: 8,
    activeClubs: 7,
    totalUsers: 1450,
    monthlyGmv: 45200,
    gmvGrowthPercent: 8.4,
  });

  const superadminClubsListMock = getSuperAdminClubsControllerFindAllResponseMock({
    items: [
      {
        id: 'club-central',
        name: 'Club Deportivo Central Pádel & Tenis',
        slug: 'central-padel',
        email: 'info@centralpadel.local',
        openingHour: 8,
        closingHour: 23,
        slotDurationMinutes: 90,
        openGameMinNoticeHours: 2,
        paymentMode: 'HYBRID',
        isActive: true,
        facilitiesCount: 10,
        membersCount: 250,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ],
    total: 1,
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    currentUserSignal.set(mockAdminUser);
    isSuperAdminSignal.set(false);
    isClubAdminSignal.set(true);
    isStaffSignal.set(false);
    canViewFinancialsSignal.set(true);
    canViewOperationalSignal.set(true);
    activeClubSignal.set({
      clubId: 'club-central',
      clubName: 'Club Deportivo Central Pádel & Tenis',
      role: 'ADMIN',
    });

    clubsDashboardServiceMock.clubDashboardControllerGetDashboard.mockReturnValue(of(fullDashboardMock));
    clubsDashboardServiceMock.clubDashboardControllerGetOperationalDashboard.mockReturnValue(of(operationalDashboardMock));
    superAdminClubsServiceMock.superAdminClubsControllerGetOverview.mockReturnValue(of(superadminOverviewMock));
    superAdminClubsServiceMock.superAdminClubsControllerFindAll.mockReturnValue(of(superadminClubsListMock));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ClubsDashboardService, useValue: clubsDashboardServiceMock },
        { provide: SuperAdminClubsService, useValue: superAdminClubsServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el nombre y apellido del usuario autenticado', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nameEl = compiled.querySelector('.user-fullname');
    expect(nameEl?.textContent).toContain('Carlos Director');
  });

  describe('Modo Club Admin / Owner', () => {
    it('debe llamar al endpoint de dashboard financiero y operativo completo', () => {
      expect(clubsDashboardServiceMock.clubDashboardControllerGetDashboard).toHaveBeenCalled();
      expect(component.dashboardData()?.month.totalRevenue).toBe(12450);
      expect(component.dashboardData()?.today.totalBookings).toBe(18);
    });

    it('debe renderizar tanto las métricas de negocio como las operativas del día', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const kpiCards = compiled.querySelectorAll('.kpi-card');
      // Debe haber tarjetas de mes (facturación, crecimiento, ocupación, socios, ticket) + tarjetas de hoy
      expect(kpiCards.length).toBeGreaterThanOrEqual(5);

      const text = compiled.textContent || '';
      expect(text).toMatch(/12[,.]450/);
      expect(text).toContain('75.5%');
      expect(text).toContain('15');
    });

    it('debe renderizar las secciones de gráficas analíticas para Admin/Owner', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const charts = compiled.querySelectorAll('p-chart');
      expect(charts.length).toBe(2);
    });
  });

  describe('Modo Staff (Solo Operativo)', () => {
    beforeEach(() => {
      canViewFinancialsSignal.set(false);
      isClubAdminSignal.set(false);
      isOwnerSignal.set(false);
      isStaffSignal.set(true);
      component.initDashboard();
      fixture.detectChanges();
    });

    it('debe llamar únicamente al endpoint operativo sin solicitar datos financieros', () => {
      expect(clubsDashboardServiceMock.clubDashboardControllerGetOperationalDashboard).toHaveBeenCalled();
      expect(component.dashboardData()?.today.totalBookings).toBe(12);
    });

    it('no debe renderizar las secciones de gráficas de ingresos ni métricas de facturación', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const charts = compiled.querySelectorAll('p-chart');
      expect(charts.length).toBe(0);

      const text = compiled.textContent || '';
      expect(text).not.toContain('12.450');
    });
  });

  describe('Modo Superadmin (Visión Global SaaS)', () => {
    beforeEach(async () => {
      const superAdminUser = getAuthControllerGetMeResponseMock({
        id: 'superadmin-1',
        email: 'superadmin@spt-app.local',
        firstName: 'Super',
        lastName: 'Admin',
        isSuperAdmin: true,
        memberships: [],
      });

      currentUserSignal.set(superAdminUser);
      isSuperAdminSignal.set(true);
      isClubAdminSignal.set(false);
      isOwnerSignal.set(false);
      isStaffSignal.set(false);
      component.initDashboard();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('debe cargar la visión global de la plataforma SaaS y la lista de clubes', () => {
      expect(superAdminClubsServiceMock.superAdminClubsControllerGetOverview).toHaveBeenCalled();
      expect(superAdminClubsServiceMock.superAdminClubsControllerFindAll).toHaveBeenCalled();
      expect(component.superadminOverview()?.totalClubs).toBe(8);
      expect(component.superadminOverview()?.totalUsers).toBe(1450);
    });

    it('debe mostrar el badge de Superadmin y el selector de club para auditar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const tag = compiled.querySelector('p-tag');
      expect(tag).toBeTruthy();

      const clubSelector = compiled.querySelector('.superadmin-club-selector');
      expect(clubSelector).toBeTruthy();
    });
  });
});
