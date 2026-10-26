import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ActivityLogItemDto,
  ActivityLogsService,
  AuthService,
  NotificationService,
  getActivityLogsControllerFindClubLogsResponseMock,
} from '@core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ActivityLogsComponent } from './activity-logs.component';

describe('ActivityLogsComponent', () => {
  let component: ActivityLogsComponent;
  let fixture: ComponentFixture<ActivityLogsComponent>;
  let activityLogsServiceSpy: any;
  let authServiceMock: any;
  let notificationServiceSpy: any;

  const mockItem: ActivityLogItemDto = {
    id: 'log-1',
    clubId: 'club-1',
    userId: 'user-1',
    action: 'BOOKING_CREATED',
    entityType: 'Booking',
    entityId: 'book-123',
    summary: 'Reserva confirmada en Pista 1',
    metadata: { facilityName: 'Pista 1', price: 20 },
    ipAddress: '192.168.1.1',
    userAgent: 'Chrome',
    createdAt: '2026-10-26T10:00:00.000Z',
    user: {
      id: 'user-1',
      fullName: 'Carlos Gómez',
      email: 'carlos@example.com',
      avatarUrl: null,
    },
  };

  const mockResponse = getActivityLogsControllerFindClubLogsResponseMock({
    data: [mockItem],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  beforeEach(async () => {
    activityLogsServiceSpy = {
      activityLogsControllerFindClubLogs: vi.fn().mockReturnValue(of(mockResponse)),
    };

    authServiceMock = {
      activeClub: vi.fn().mockReturnValue({ clubId: 'club-1', name: 'Club Central' }),
    };

    notificationServiceSpy = {
      error: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ActivityLogsComponent],
      providers: [
        provideHttpClient(),
        provideTranslateService({ lang: 'es' }),
        MessageService,
        { provide: ActivityLogsService, useValue: activityLogsServiceSpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente y cargar los logs de auditoría en ngOnInit', () => {
    expect(component).toBeTruthy();
    expect(activityLogsServiceSpy.activityLogsControllerFindClubLogs).toHaveBeenCalledWith(
      'club-1',
      expect.objectContaining({ page: 1, limit: 20 }),
    );
    expect(component.logs).toHaveLength(1);
    expect(component.totalRecords).toBe(1);
    const compiled = fixture.nativeElement;
    console.log("SELECT_CLASS:", compiled.querySelector("p-select")?.className);
    console.log("INPUT_CLASS:", compiled.querySelector("input[pInputText]")?.className);
    console.log("DP_CLASS:", compiled.querySelector("p-datepicker input")?.className);
    console.log("BTN_CLASS:", compiled.querySelector("button[pButton]")?.className);

    expect(component.loading).toBe(false);


  });

  it('debe no cargar datos si no hay club activo', () => {
    authServiceMock.activeClub.mockReturnValue(null);
    component.loadLogs();

    expect(component.logs).toEqual([]);
    expect(component.totalRecords).toBe(0);
  });

  it('debe soportar evento de lazy loading de PrimeNG para cambiar página y límite', () => {
    component.loadLogs({ first: 40, rows: 20 });

    expect(component.page).toBe(3);
    expect(component.rows).toBe(20);
    expect(activityLogsServiceSpy.activityLogsControllerFindClubLogs).toHaveBeenCalledWith(
      'club-1',
      expect.objectContaining({ page: 3, limit: 20 }),
    );
  });

  it('debe filtrar por categoría, texto libre y rango de fechas', () => {
    component.selectedCategory = 'Booking';
    component.searchTerm = 'Pista 1';
    component.dateRange = [new Date('2026-10-01'), new Date('2026-10-31')];

    component.onFilterChange();

    expect(component.page).toBe(1);
    expect(activityLogsServiceSpy.activityLogsControllerFindClubLogs).toHaveBeenCalledWith(
      'club-1',
      expect.objectContaining({
        page: 1,
        entityType: 'Booking',
        search: 'Pista 1',
        startDate: expect.any(String),
        endDate: expect.any(String),
      }),
    );
  });

  it('debe limpiar los filtros correctamente con clearFilters', () => {
    component.selectedCategory = 'Facility';
    component.searchTerm = 'algo';
    component.dateRange = [new Date()];

    component.clearFilters();

    expect(component.selectedCategory).toBe('ALL');
    expect(component.searchTerm).toBe('');
    expect(component.dateRange).toBeNull();
    expect(component.page).toBe(1);
  });

  it('debe manejar error de red al cargar logs', () => {
    activityLogsServiceSpy.activityLogsControllerFindClubLogs.mockReturnValue(
      throwError(() => new Error('Error de red')),
    );

    component.loadLogs();

    expect(component.loading).toBe(false);
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('ERRORS.NETWORK');
  });

  it('debe abrir el modal de inspección detallada', () => {
    component.openDetail(mockItem);

    expect(component.selectedLog).toEqual(mockItem);
    expect(component.displayModal).toBe(true);
  });

  it('debe copiar JSON al portapapeles y notificar', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    component.selectedLog = mockItem;

    component.copyJson();

    expect(writeTextMock).toHaveBeenCalled();
  });

  it('debe retornar severidad adecuada para cada tipo de acción', () => {
    expect(component.getActionSeverity('BOOKING_CREATED')).toBe('success');
    expect(component.getActionSeverity('FACILITY_UPDATED')).toBe('warn');
    expect(component.getActionSeverity('BOOKING_CANCELLED')).toBe('danger');
    expect(component.getActionSeverity('CLUB_STATUS_TOGGLED')).toBe('info');
  });

  it('debe exportar los logs a CSV correctamente', () => {
    component.logs = [mockItem];
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    component.exportCsv();

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    // Si logs está vacío no hace nada
    component.logs = [];
    component.exportCsv();
  });
});
