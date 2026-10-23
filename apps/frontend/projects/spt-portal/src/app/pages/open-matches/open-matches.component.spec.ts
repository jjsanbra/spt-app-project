import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  BookingsService,
  ConfirmDialogService,
  NotificationService,
  OpenMatchParticipantDtoStatus,
  OpenMatchResponseDto,
  OpenMatchResponseDtoSportType as SportType,
  getBookingsControllerJoinOpenMatchResponseMock,
} from '@core';
import { of, throwError } from 'rxjs';
import { OpenMatchesComponent } from './open-matches.component';

describe('OpenMatchesComponent', () => {
  let component: OpenMatchesComponent;
  let fixture: ComponentFixture<OpenMatchesComponent>;
  let mockBookingsService: any;
  let mockNotify: any;
  let mockConfirmService: any;

  const mockOpenMatches: OpenMatchResponseDto[] = [
    getBookingsControllerJoinOpenMatchResponseMock({
      id: 'open-1',
      clubId: 'club-1',
      facilityId: 'fac-1',
      facilityName: 'Pista 1 Central',
      sportType: SportType.PADEL,
      startTime: '2026-10-25T18:00:00.000Z' as any,
      endTime: '2026-10-25T19:30:00.000Z' as any,
      totalPrice: 24.0,
      pricePerPlayer: 6.0,
      maxPlayers: 4,
      availableSlots: 2,
      occupiedSlots: 2,
      isCurrentUserJoined: false,
      isCurrentUserHost: false,
      participants: [
        {
          id: 'p-1',
          userId: 'user-host',
          name: 'Carlos Martínez',
          avatarUrl: null,
          slotNumber: 1,
          isHost: true,
          status: OpenMatchParticipantDtoStatus.REGISTERED,
          joinedAt: '2026-10-20T10:00:00.000Z' as any,
        },
        {
          id: 'p-2',
          userId: 'user-2',
          name: 'Laura Gómez',
          avatarUrl: null,
          slotNumber: 2,
          isHost: false,
          status: OpenMatchParticipantDtoStatus.REGISTERED,
          joinedAt: '2026-10-20T11:00:00.000Z' as any,
        },
      ],
    }),
  ];

  beforeEach(async () => {
    mockBookingsService = {
      bookingsControllerFindOpenMatches: vi.fn().mockReturnValue(of(mockOpenMatches)),
      bookingsControllerJoinOpenMatch: vi.fn().mockReturnValue(of({ ...mockOpenMatches[0], isCurrentUserJoined: true })),
      bookingsControllerLeaveOpenMatch: vi.fn().mockReturnValue(of({ success: true, message: 'OK' })),
    };

    mockNotify = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    mockConfirmService = {
      confirm: vi.fn().mockImplementation((config: any) => {
        if (config.onAccept) {
          config.onAccept();
        }
      }),
    };

    await TestBed.configureTestingModule({
      imports: [OpenMatchesComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService(),
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: NotificationService, useValue: mockNotify },
        { provide: ConfirmDialogService, useValue: mockConfirmService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenMatchesComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse y cargar las partidas abiertas al inicializar', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(mockBookingsService.bookingsControllerFindOpenMatches).toHaveBeenCalled();
    expect(component.matches.length).toBe(1);
    expect(component.matches[0].facilityName).toBe('Pista 1 Central');
  });

  it('debe cambiar la fecha rápida y recargar partidas', () => {
    fixture.detectChanges();
    component.setQuickDate(1);
    expect(mockBookingsService.bookingsControllerFindOpenMatches).toHaveBeenCalledTimes(2);
  });

  it('debe confirmar e inscribir al usuario en una partida con plazas disponibles', () => {
    fixture.detectChanges();
    const match = mockOpenMatches[0];
    component.confirmJoinMatch(match);

    expect(mockConfirmService.confirm).toHaveBeenCalled();
    expect(mockBookingsService.bookingsControllerJoinOpenMatch).toHaveBeenCalledWith(match.id);
    expect(mockNotify.success).toHaveBeenCalledWith('PORTAL.OPEN_MATCHES.SUCCESS_JOIN');
  });

  it('debe advertir si la partida se completó concurrentemente (error 409)', () => {
    mockBookingsService.bookingsControllerJoinOpenMatch.mockReturnValue(
      throwError(() => ({ status: 409 }))
    );
    fixture.detectChanges();

    component.confirmJoinMatch(mockOpenMatches[0]);
    expect(mockNotify.warn).toHaveBeenCalledWith('PORTAL.OPEN_MATCHES.FULL_MATCH');
  });

  it('debe confirmar y abandonar una partida si el usuario está inscrito', () => {
    fixture.detectChanges();
    const match = { ...mockOpenMatches[0], isCurrentUserJoined: true };
    component.confirmLeaveMatch(match);

    expect(mockConfirmService.confirm).toHaveBeenCalled();
    expect(mockBookingsService.bookingsControllerLeaveOpenMatch).toHaveBeenCalledWith(match.id);
    expect(mockNotify.success).toHaveBeenCalledWith('PORTAL.OPEN_MATCHES.SUCCESS_LEAVE');
  });

  it('debe calcular correctamente el número de huecos libres', () => {
    const emptySlots = component.getEmptySlotsCount(mockOpenMatches[0]);
    expect(emptySlots.length).toBe(2);
  });
});
