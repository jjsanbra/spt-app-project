import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ActivityLogItemDto,
  ActivityLogsService,
  NotificationService,
  getActivityLogsControllerFindMyLogsResponseMock,
} from '@core';
import { of, throwError } from 'rxjs';
import { UserActivityComponent } from './user-activity.component';

describe('UserActivityComponent', () => {
  let component: UserActivityComponent;
  let fixture: ComponentFixture<UserActivityComponent>;
  let activityLogsServiceSpy: any;
  let notificationServiceSpy: any;

  const mockItem: ActivityLogItemDto = {
    id: 'log-my-1',
    clubId: 'club-1',
    userId: 'user-me',
    action: 'BOOKING_CREATED',
    entityType: 'Booking',
    entityId: 'b-999',
    summary: 'Has reservado Pista 1 para el 27/10 a las 18:00',
    metadata: { facilityName: 'Pista 1', price: 18 },
    ipAddress: '127.0.0.1',
    userAgent: 'Browser',
    createdAt: '2026-10-26T10:00:00.000Z',
  };

  const mockResponse = getActivityLogsControllerFindMyLogsResponseMock({
    data: [mockItem],
    total: 1,
    page: 1,
    limit: 15,
    totalPages: 1,
  });

  beforeEach(async () => {
    activityLogsServiceSpy = {
      activityLogsControllerFindMyLogs: vi.fn().mockReturnValue(of(mockResponse)),
    };

    notificationServiceSpy = {
      error: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UserActivityComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: ActivityLogsService, useValue: activityLogsServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente y cargar el historial de actividades del usuario', () => {
    expect(component).toBeTruthy();
    expect(activityLogsServiceSpy.activityLogsControllerFindMyLogs).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 15 }),
    );
    expect(component.logs).toHaveLength(1);
    expect(component.totalRecords).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('debe soportar lazy loading para paginar los logs personales', () => {
    component.loadLogs({ first: 15, rows: 15 });

    expect(component.page).toBe(2);
    expect(activityLogsServiceSpy.activityLogsControllerFindMyLogs).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 15 }),
    );
  });

  it('debe filtrar por categoría y término de búsqueda', () => {
    component.selectedCategory = 'Booking';
    component.searchTerm = 'Pista';

    component.onFilterChange();

    expect(component.page).toBe(1);
    expect(activityLogsServiceSpy.activityLogsControllerFindMyLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        entityType: 'Booking',
        search: 'Pista',
      }),
    );
  });

  it('debe manejar error de red al consultar actividades personales', () => {
    activityLogsServiceSpy.activityLogsControllerFindMyLogs.mockReturnValue(
      throwError(() => new Error('Error al cargar actividades')),
    );

    component.loadLogs();

    expect(component.loading).toBe(false);
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
  });

  it('debe abrir y cerrar el modal de detalle del log', () => {
    component.openDetail(mockItem);

    expect(component.selectedLog).toEqual(mockItem);
    expect(component.displayModal).toBe(true);
  });

  it('debe retornar la severidad adecuada según la acción', () => {
    expect(component.getActionSeverity('BOOKING_CREATED')).toBe('success');
    expect(component.getActionSeverity('BOOKING_CANCELLED')).toBe('danger');
    expect(component.getActionSeverity('AUTH_LOGIN_SUCCESS')).toBe('success');
    expect(component.getActionSeverity('FACILITY_UPDATED')).toBe('warn');
    expect(component.getActionSeverity('OTHER_ACTION')).toBe('info');
  });
});
