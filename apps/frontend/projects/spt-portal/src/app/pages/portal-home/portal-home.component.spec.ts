import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ThemeService,
  UsersService,
  UserSummaryDto,
  getAuthControllerGetMeResponseMock,
  getUsersControllerGetDashboardResponseMock,
} from '@core';
import { PortalHomeComponent } from './portal-home.component';

describe('PortalHomeComponent', () => {
  let component: PortalHomeComponent;
  let fixture: ComponentFixture<PortalHomeComponent>;

  const mockPlayerUser: UserSummaryDto = getAuthControllerGetMeResponseMock({
    id: 'player-user-1',
    email: 'socio@spt-app.local',
    firstName: 'Marcos',
    lastName: 'Gómez',
    isSuperAdmin: false,
    memberships: [
      {
        clubId: 'club-central',
        clubName: 'Club Deportivo Central Pádel & Tenis',
        clubSlug: 'central-padel',
        role: 'MEMBER',
        memberNumber: 'SOC-001',
        walletBalance: 50.0,
      },
    ],
  });

  const currentUserSignal = signal<UserSummaryDto | null>(mockPlayerUser);

  const authServiceMock = {
    currentUser: currentUserSignal,
  };

  const usersServiceMock = {
    usersControllerGetDashboard: vi.fn(),
  };

  const themeServiceMock = {
    isDark: signal<boolean>(false),
  };

  const mockDashboardDataWithBooking = getUsersControllerGetDashboardResponseMock({
    nextBooking: {
      id: 'booking-next-1',
      facilityName: 'Pista Central Pádel',
      sportType: 'PADEL',
      startTime: '2026-10-30T18:00:00Z',
      endTime: '2026-10-30T19:30:00Z',
    },
    monthlyStats: {
      matchesPlayed: 8,
      hoursPlayed: 12,
      totalSpent: 96,
      estimatedLevel: '4.2',
    },
    activityHistory: [
      { month: 'Jul', matchesCount: 6 },
      { month: 'Ago', matchesCount: 4 },
      { month: 'Sep', matchesCount: 9 },
      { month: 'Oct', matchesCount: 8 },
    ],
  });

  const mockDashboardDataWithoutBooking = getUsersControllerGetDashboardResponseMock({
    nextBooking: null,
    monthlyStats: {
      matchesPlayed: 0,
      hoursPlayed: 0,
      totalSpent: 0,
      estimatedLevel: '3.5',
    },
    activityHistory: [],
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    currentUserSignal.set(mockPlayerUser);
    usersServiceMock.usersControllerGetDashboard.mockReturnValue(of(mockDashboardDataWithBooking));

    await TestBed.configureTestingModule({
      imports: [PortalHomeComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortalHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el saludo con el nombre de pila del usuario', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitleEl = compiled.querySelector('.welcome-subtitle');
    expect(subtitleEl?.textContent).toContain('Marcos');
  });

  it('debe llamar a usersControllerGetDashboard al inicializarse', () => {
    expect(usersServiceMock.usersControllerGetDashboard).toHaveBeenCalled();
    expect(component.dashboardData()?.monthlyStats.matchesPlayed).toBe(8);
  });

  it('debe renderizar la tarjeta de próxima reserva destacada cuando existe', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cardEl = compiled.querySelector('.next-booking-card');
    expect(cardEl).toBeTruthy();

    const text = cardEl?.textContent || '';
    expect(text).toContain('Pista Central Pádel');
    expect(text).toContain('PADEL');
  });

  it('debe mostrar los KPIs de rendimiento del mes del socio', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statCards = compiled.querySelectorAll('.player-kpis-grid .kpi-card');
    expect(statCards.length).toBe(4);

    const text = compiled.textContent || '';
    expect(text).toContain('8'); // Partidos
    expect(text).toContain('12'); // Horas
    expect(text).toContain('96'); // Inversión €
    expect(text).toContain('4.2'); // Nivel
  });

  it('debe renderizar el gráfico de actividad deportiva del usuario', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chart = compiled.querySelector('p-chart');
    expect(chart).toBeTruthy();
  });

  it('debe mostrar el estado vacío con CTA de reserva cuando no hay partidos próximos', () => {
    usersServiceMock.usersControllerGetDashboard.mockReturnValue(of(mockDashboardDataWithoutBooking));
    component.loadUserDashboard();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyCta = compiled.querySelector('.no-booking-card');
    expect(emptyCta).toBeTruthy();
    expect(compiled.querySelector('.next-booking-card')).toBeNull();
  });
});
