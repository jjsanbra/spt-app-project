import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  AuthService,
  BookingsService,
  FacilitiesService,
  FacilityAvailabilityResponseDto,
  NotificationService,
  TimeSlotAvailabilityDtoStatus as SlotStatus,
  getBookingsControllerCreateResponseMock,
} from '@core';
import { of, throwError } from 'rxjs';
import { BookingsGridComponent } from './bookings-grid.component';

describe('BookingsGridComponent', () => {
  let component: BookingsGridComponent;
  let fixture: ComponentFixture<BookingsGridComponent>;
  let mockFacilitiesService: any;
  let mockBookingsService: any;
  let mockNotify: any;
  let mockAuthService: {
    isOwnerOrSuperAdmin: ReturnType<typeof signal<boolean>>;
    activeClub: ReturnType<typeof signal<any>>;
    currentUser: ReturnType<typeof signal<any>>;
  };

  const mockAvailability: FacilityAvailabilityResponseDto[] = [
    {
      facilityId: 'fac-1',
      facilityName: 'Pista 1 Central',
      sportType: 'PADEL' as any,
      courtType: 'INDOOR' as any,
      surfaceType: 'CRYSTAL' as any,
      hasLighting: true,
      defaultSlotMinutes: 90,
      slots: [
        {
          startTime: '2026-10-25T09:00:00.000Z',
          endTime: '2026-10-25T10:30:00.000Z',
          startHourText: '09:00',
          endHourText: '10:30',
          status: SlotStatus.AVAILABLE,
          price: 16.0,
          isPeakHour: false,
          lightSurcharge: 2.0,
        },
      ],
    },
  ];

  beforeEach(async () => {
    mockFacilitiesService = {
      facilitiesControllerGetAvailability: vi.fn().mockReturnValue(of(mockAvailability)),
    };

    mockBookingsService = {
      bookingsControllerCreate: vi.fn().mockReturnValue(of(getBookingsControllerCreateResponseMock({ id: 'book-1' }))),
    };

    mockNotify = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    mockAuthService = {
      isOwnerOrSuperAdmin: signal(false),
      activeClub: signal({ clubId: 'club-1', role: 'MEMBER' }),
      currentUser: signal({ id: 'u1', isSuperAdmin: false }),
    };

    await TestBed.configureTestingModule({
      imports: [BookingsGridComponent],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'portal/my-bookings', component: class DummyComponent {} }]),
        provideTranslateService(),
        { provide: FacilitiesService, useValue: mockFacilitiesService },
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: NotificationService, useValue: mockNotify },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectedDate = '2099-12-31';
  });

  it('debe crearse y cargar disponibilidad al inicializar', () => {
    expect(component).toBeTruthy();
    expect(mockFacilitiesService.facilitiesControllerGetAvailability).toHaveBeenCalled();
    expect(component.facilitiesAvailability.length).toBe(1);
    expect(component.facilitiesAvailability[0].facilityName).toBe('Pista 1 Central');
  });

  it('debe abrir la modal de confirmación al seleccionar un slot disponible', () => {
    const facility = component.facilitiesAvailability[0];
    const slot = facility.slots[0];

    component.selectSlot(facility, slot);

    expect(component.displayConfirmModal).toBe(true);
    expect(component.selectedFacility?.facilityId).toBe('fac-1');
    expect(component.selectedSlot?.startHourText).toBe('09:00');
  });

  it('debe confirmar la reserva y llamar a BookingsService.create', () => {
    const facility = component.facilitiesAvailability[0];
    const slot = facility.slots[0];
    component.selectSlot(facility, slot);

    component.confirmBooking();

    expect(mockBookingsService.bookingsControllerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        facilityId: 'fac-1',
        startTime: slot.startTime,
        endTime: slot.endTime,
      }),
    );
    expect(mockNotify.success).toHaveBeenCalledWith('PORTAL.BOOKINGS.SUCCESS_CREATE');
  });

  it('debe advertir si la franja ya fue ocupada (409 Conflict)', () => {
    mockBookingsService.bookingsControllerCreate.mockReturnValue(
      throwError(() => ({ status: 409 })),
    );

    const facility = component.facilitiesAvailability[0];
    const slot = facility.slots[0];
    component.selectSlot(facility, slot);
    component.confirmBooking();
    expect(mockNotify.error).toHaveBeenCalled();
    expect(component.displayConfirmModal).toBe(false);
  });

  it('debe actualizar la fecha y recargar disponibilidad con onDatePickerChange', () => {
    const testDate = new Date(2026, 10, 15); // 15 de Noviembre de 2026
    component.onDatePickerChange(testDate);

    expect(component.selectedCalendarDate).toEqual(testDate);
    expect(component.selectedDate).toBe('2026-11-15');
    expect(mockFacilitiesService.facilitiesControllerGetAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-11-15' }),
    );
  });

  it('debe computar correctamente uniqueTimeSlots y getSlotForFacilityAndTime para la matriz', () => {
    expect(component.uniqueTimeSlots).toEqual(['09:00 - 10:30']);

    const facility = component.facilitiesAvailability[0];
    const slot = component.getSlotForFacilityAndTime(facility, '09:00 - 10:30');
    expect(slot).toBeDefined();
    expect(slot?.price).toBe(16.0);

    const nonExistentSlot = component.getSlotForFacilityAndTime(facility, '18:00 - 19:30');
    expect(nonExistentSlot).toBeUndefined();
  });

  it('debe permitir alternar el viewMode entre grid y cards', () => {
    expect(component.viewMode).toBe('grid');
    component.viewMode = 'cards';
    expect(component.viewMode).toBe('cards');
    expect(component.viewModeOptions.length).toBe(2);
  });

  it('debe devolver las opciones de deportes en sportFilterOptions', () => {
    expect(component.sportFilterOptions.length).toBeGreaterThan(5);
    expect(component.sportFilterOptions[0].value).toBeNull();
  });

  it('debe manejar onSportChange actualizando el deporte y recargando disponibilidad', () => {
    component.onSportChange({ value: 'TENNIS' });
    expect(component.selectedSport).toBe('TENNIS');
    expect(mockFacilitiesService.facilitiesControllerGetAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ sportType: 'TENNIS' }),
    );
  });

  it('debe ignorar fechas nulas en onDatePickerChange', () => {
    const prevDate = component.selectedDate;
    component.onDatePickerChange(null);
    expect(component.selectedDate).toBe(prevDate);
  });

  it('debe manejar onDateChange y actualizar selectedCalendarDate', () => {
    component.onDateChange('2026-12-25');
    expect(component.selectedDate).toBe('2026-12-25');
    expect(component.selectedCalendarDate.getFullYear()).toBe(2026);
    expect(component.selectedCalendarDate.getMonth()).toBe(11);
    expect(component.selectedCalendarDate.getDate()).toBe(25);
  });

  it('no debe abrir modal si el slot no está disponible', () => {
    const facility = component.facilitiesAvailability[0];
    const occupiedSlot = { ...facility.slots[0], status: SlotStatus.OCCUPIED };
    component.selectSlot(facility, occupiedSlot);
    expect(component.displayConfirmModal).toBe(false);
  });

  it('debe cerrar la modal de confirmación con closeConfirmModal', () => {
    component.selectedDate = '2099-12-31';
    const facility = component.facilitiesAvailability[0];
    component.selectSlot(facility, facility.slots[0]);
    expect(component.displayConfirmModal).toBe(true);

    component.closeConfirmModal();
    expect(component.displayConfirmModal).toBe(false);
    expect(component.selectedFacility).toBeNull();
    expect(component.selectedSlot).toBeNull();
  });

  it('debe calcular el precio total del modal con y sin luz', () => {
    expect(component.calculateTotalModalPrice()).toBe(0);

    component.selectedDate = '2099-12-31';
    const facility = component.facilitiesAvailability[0];
    component.selectSlot(facility, facility.slots[0]);

    // Sin luz: 16.0
    expect(component.calculateTotalModalPrice()).toBe(16.0);

    // Con luz: 16.0 + 2.0 = 18.0
    component.bookingForm.patchValue({ lightIncluded: true });
    expect(component.calculateTotalModalPrice()).toBe(18.0);
  });

  it('debe manejar setToday, setTomorrow e isTodaySelected', () => {
    component.setToday();
    expect(component.isTodaySelected()).toBe(true);

    component.setTomorrow();
    expect(component.isTodaySelected()).toBe(false);
  });

  it('debe notificar error general en loadAvailability si el servicio falla', () => {
    mockFacilitiesService.facilitiesControllerGetAvailability.mockReturnValue(
      throwError(() => new Error('Network error')),
    );
    component.loadAvailability();
    expect(mockNotify.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
    expect(component.loading).toBe(false);
  });

  it('debe notificar error general en confirmBooking si ocurre error 500', () => {
    mockBookingsService.bookingsControllerCreate.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );
    component.selectedDate = '2099-12-31';
    const facility = component.facilitiesAvailability[0];
    component.selectSlot(facility, facility.slots[0]);
    component.confirmBooking();

    expect(mockNotify.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
    expect(component.bookingInProgress).toBe(false);
  });

  it('debe devolver las opciones de granularidad (día, semana, mes)', () => {
    expect(component.granularityOptions.length).toBe(3);
    expect(component.granularityOptions.map((g) => g.value)).toEqual(['day', 'week', 'month']);
  });

  it('debe navegar por semanas y computar los 7 días correctamente', () => {
    const initialWeekStart = new Date(component.selectedWeekStart);
    expect(component.weekDays.length).toBe(7);

    component.nextWeek();
    expect(component.selectedWeekStart.getTime()).toBeGreaterThan(initialWeekStart.getTime());

    component.prevWeek();
    expect(component.selectedWeekStart.getTime()).toBe(initialWeekStart.getTime());

    component.currentWeek();
    expect(component.selectedWeekStart).toBeDefined();
  });

  it('debe devolver activeWeekFacility y facilitySelectOptions', () => {
    expect(component.facilitySelectOptions.length).toBe(1);
    expect(component.activeWeekFacility?.facilityId).toBe('fac-1');

    component.selectedWeekFacilityId = 'fac-1';
    expect(component.activeWeekFacility?.facilityId).toBe('fac-1');

    component.selectedWeekFacilityId = 'non-existent';
    expect(component.activeWeekFacility?.facilityId).toBe('fac-1');
  });

  it('debe navegar por meses y permitir saltar a un día con goToDayFromMonth', () => {
    const initialMonth = component.selectedMonthDate.getMonth();
    expect(component.monthDays.length).toBeGreaterThan(27);

    component.nextMonth();
    expect(component.selectedMonthDate.getMonth()).toBe((initialMonth + 1) % 12);

    component.prevMonth();
    expect(component.selectedMonthDate.getMonth()).toBe(initialMonth);

    component.currentMonth();
    expect(component.selectedMonthDate).toBeDefined();

    const targetDate = new Date(2026, 9, 15);
    component.goToDayFromMonth(targetDate);
    expect(component.calendarGranularity).toBe('day');
    expect(component.selectedDate).toBe('2026-10-15');
  });

  it('debe calcular reserva en slot vacío al llamar a onEmptySlotClick y abrir modal', () => {
    const facility = component.facilitiesAvailability[0];
    component.onEmptySlotClick(facility, '14:00 - 15:30', '2099-12-31');

    expect(component.displayConfirmModal).toBe(true);
    expect(component.selectedSlot).toBeDefined();
    expect(component.selectedSlot?.startHourText).toBe('14:00');
    expect(component.selectedSlot?.status).toBe(SlotStatus.AVAILABLE);
  });

  it('debe advertir si el tiempo disponible antes de otro slot es menor a 30 minutos', () => {
    const facilityWithNearbySlot: FacilityAvailabilityResponseDto = {
      facilityId: 'fac-2',
      facilityName: 'Pista 2',
      sportType: 'PADEL' as any,
      courtType: 'INDOOR' as any,
      surfaceType: 'CRYSTAL' as any,
      hasLighting: false,
      defaultSlotMinutes: 90,
      slots: [
        {
          startTime: '2099-12-31T14:15:00.000Z',
          endTime: '2099-12-31T15:45:00.000Z',
          startHourText: '14:15',
          endHourText: '15:45',
          status: SlotStatus.OCCUPIED,
          price: 16.0,
          isPeakHour: false,
          lightSurcharge: 0,
        },
      ],
    };

    mockNotify.warn = vi.fn();
    // Inicia a las 14:00 pero hay un slot ocupado a las 14:15 (solo 15 min disponibles)
    component.onEmptySlotClick(facilityWithNearbySlot, '14:00 - 15:30', '2099-12-31');

    expect(mockNotify.warn).toHaveBeenCalledWith('PORTAL.BOOKINGS.TIME_NOT_AVAILABLE');
    expect(component.displayConfirmModal).toBe(false);
  });

  describe('Lógica de bloqueo por antelación de 2 horas y fechas pasadas (isSlotBlockedByCutoff)', () => {
    it('debe bloquear fechas pasadas', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = component.formatDate(yesterday);

      expect(component.isSlotBlockedByCutoff(yesterdayStr, '10:00')).toBe(true);
      expect(component.isSlotBlockedByCutoff(yesterdayStr, '22:00')).toBe(true);
    });

    it('debe bloquear slots de hoy que estén a menos de 2 horas de la hora actual', () => {
      const todayStr = component.getTodayDateString();
      const now = new Date();
      // 1 hora antes de ahora
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourAgoStr = `${String(oneHourAgo.getHours()).padStart(2, '0')}:00`;

      expect(component.isSlotBlockedByCutoff(todayStr, oneHourAgoStr)).toBe(true);
    });

    it('debe permitir slots de fechas futuras o de hoy con más de 2 horas de margen', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = component.formatDate(tomorrow);

      expect(component.isSlotBlockedByCutoff(tomorrowStr, '10:00')).toBe(false);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = component.formatDate(nextWeek);
      expect(component.isSlotBlockedByCutoff(nextWeekStr, '18:00')).toBe(false);
    });

    it('debe impedir selectSlot si el slot incumple la antelación mínima de 2 horas', () => {
      mockNotify.warn = vi.fn();
      const facility = component.facilitiesAvailability[0];
      const slot = facility.slots[0];

      // Intentar reservar en fecha pasada
      component.selectSlot(facility, slot, '2020-01-01');

      expect(mockNotify.warn).toHaveBeenCalledWith('PORTAL.BOOKINGS.ERR_CUTOFF_LIMIT');
      expect(component.displayConfirmModal).toBe(false);
    });

    it('debe impedir onEmptySlotClick si la fecha/hora incumple la antelación de 2 horas', () => {
      mockNotify.warn = vi.fn();
      const facility = component.facilitiesAvailability[0];

      // Intentar reservar slot vacío en fecha pasada
      component.onEmptySlotClick(facility, '10:00 - 11:30', '2020-01-01');

      expect(mockNotify.warn).toHaveBeenCalledWith('PORTAL.BOOKINGS.ERR_CUTOFF_LIMIT');
      expect(component.displayConfirmModal).toBe(false);
    });

    it('para OWNER o SUPER_ADMIN, debe permitir reservar con menos de 2 horas de antelación si no está en el pasado', () => {
      mockAuthService.isOwnerOrSuperAdmin.set(true);
      const todayStr = component.getTodayDateString();
      const now = new Date();
      // Franja que empieza dentro de 30 minutos (menos de 2 horas)
      const inThirtyMin = new Date(now.getTime() + 30 * 60 * 1000);
      const inThirtyMinStr = `${String(inThirtyMin.getHours()).padStart(2, '0')}:${String(inThirtyMin.getMinutes()).padStart(2, '0')}`;

      expect(component.isSlotBlockedByCutoff(todayStr, inThirtyMinStr)).toBe(false);
    });

    it('para OWNER o SUPER_ADMIN, debe bloquear si el slot está en el pasado y notificar ERR_PAST_DATE en selectSlot', () => {
      mockAuthService.isOwnerOrSuperAdmin.set(true);
      mockNotify.warn = vi.fn();
      const facility = component.facilitiesAvailability[0];
      const slot = facility.slots[0];

      // Fecha pasada
      expect(component.isSlotBlockedByCutoff('2020-01-01', '10:00')).toBe(true);

      component.selectSlot(facility, slot, '2020-01-01');
      expect(mockNotify.warn).toHaveBeenCalledWith('PORTAL.BOOKINGS.ERR_PAST_DATE');
      expect(component.displayConfirmModal).toBe(false);
    });

    it('para OWNER o SUPER_ADMIN, calculateTotalModalPrice debe ser siempre 0.00 (exento)', () => {
      mockAuthService.isOwnerOrSuperAdmin.set(true);
      component.selectedSlot = component.facilitiesAvailability[0].slots[0];
      component.selectedFacility = component.facilitiesAvailability[0];
      component.bookingForm.patchValue({ lightIncluded: true });

      expect(component.calculateTotalModalPrice()).toBe(0);
    });

    it('debe devolver tooltip adecuado en getCutoffTooltip segun privilegios del usuario', () => {
      mockAuthService.isOwnerOrSuperAdmin.set(false);
      expect(component.getCutoffTooltip()).toContain('PORTAL.BOOKINGS.SLOT_CUTOFF_TOOLTIP');

      mockAuthService.isOwnerOrSuperAdmin.set(true);
      expect(component.getCutoffTooltip()).toContain('PORTAL.BOOKINGS.SLOT_PAST_TOOLTIP');
    });
  });

  describe('sportGridGroups (agrupación por deporte sin solapamiento de slots)', () => {
    it('debe devolver un array vacío si no hay disponibilidad', () => {
      component.facilitiesAvailability = [];
      expect(component.sportGridGroups).toEqual([]);
    });

    it('debe agrupar pistas por deporte y calcular franjas horarias independientes', () => {
      component.facilitiesAvailability = [
        {
          facilityId: 'padel-1',
          facilityName: 'Pádel 1',
          sportType: 'PADEL' as any,
          courtType: 'INDOOR' as any,
          surfaceType: 'CRYSTAL' as any,
          hasLighting: true,
          defaultSlotMinutes: 90,
          slots: [
            { startTime: 'T09:00:00Z', endTime: 'T10:30:00Z', startHourText: '09:00', endHourText: '10:30', status: SlotStatus.AVAILABLE, price: 16, isPeakHour: false, lightSurcharge: 0 },
            { startTime: 'T10:30:00Z', endTime: 'T12:00:00Z', startHourText: '10:30', endHourText: '12:00', status: SlotStatus.AVAILABLE, price: 16, isPeakHour: false, lightSurcharge: 0 },
          ],
        },
        {
          facilityId: 'padel-2',
          facilityName: 'Pádel 2',
          sportType: 'PADEL' as any,
          courtType: 'INDOOR' as any,
          surfaceType: 'CRYSTAL' as any,
          hasLighting: true,
          defaultSlotMinutes: 90,
          slots: [
            { startTime: 'T09:00:00Z', endTime: 'T10:30:00Z', startHourText: '09:00', endHourText: '10:30', status: SlotStatus.AVAILABLE, price: 16, isPeakHour: false, lightSurcharge: 0 },
          ],
        },
        {
          facilityId: 'tennis-1',
          facilityName: 'Tenis 1',
          sportType: 'TENNIS' as any,
          courtType: 'OUTDOOR' as any,
          surfaceType: 'CLAY' as any,
          hasLighting: true,
          defaultSlotMinutes: 60,
          slots: [
            { startTime: 'T09:00:00Z', endTime: 'T10:00:00Z', startHourText: '09:00', endHourText: '10:00', status: SlotStatus.AVAILABLE, price: 12, isPeakHour: false, lightSurcharge: 0 },
            { startTime: 'T10:00:00Z', endTime: 'T11:00:00Z', startHourText: '10:00', endHourText: '11:00', status: SlotStatus.AVAILABLE, price: 12, isPeakHour: false, lightSurcharge: 0 },
          ],
        },
      ];

      const groups = component.sportGridGroups;
      expect(groups.length).toBe(2);

      // Grupo Pádel
      const padelGroup = groups.find((g) => g.sportType === 'PADEL');
      expect(padelGroup).toBeDefined();
      expect(padelGroup?.facilities.length).toBe(2);
      expect(padelGroup?.defaultSlotMinutes).toBe(90);
      expect(padelGroup?.timeSlots).toEqual(['09:00 - 10:30', '10:30 - 12:00']);
      expect(padelGroup?.peakHoursRange).toBeNull();

      // Grupo Tenis
      const tennisGroup = groups.find((g) => g.sportType === 'TENNIS');
      expect(tennisGroup).toBeDefined();
      expect(tennisGroup?.facilities.length).toBe(1);
      expect(tennisGroup?.defaultSlotMinutes).toBe(60);
      expect(tennisGroup?.timeSlots).toEqual(['09:00 - 10:00', '10:00 - 11:00']);
      expect(tennisGroup?.peakHoursRange).toBeNull();
    });

    it('debe calcular peakHoursRange correctamente cuando hay slots punta', () => {
      component.facilitiesAvailability = [
        {
          facilityId: 'padel-1',
          facilityName: 'Pádel 1',
          sportType: 'PADEL' as any,
          courtType: 'INDOOR' as any,
          surfaceType: 'CRYSTAL' as any,
          hasLighting: true,
          defaultSlotMinutes: 90,
          slots: [
            { startTime: 'T17:00:00Z', endTime: 'T18:30:00Z', startHourText: '17:00', endHourText: '18:30', status: SlotStatus.AVAILABLE, price: 24, isPeakHour: true, lightSurcharge: 2 },
            { startTime: 'T18:30:00Z', endTime: 'T20:00:00Z', startHourText: '18:30', endHourText: '20:00', status: SlotStatus.AVAILABLE, price: 24, isPeakHour: true, lightSurcharge: 2 },
            { startTime: 'T20:00:00Z', endTime: 'T21:30:00Z', startHourText: '20:00', endHourText: '21:30', status: SlotStatus.AVAILABLE, price: 24, isPeakHour: true, lightSurcharge: 2 },
          ],
        },
      ];

      const groups = component.sportGridGroups;
      expect(groups[0].peakHoursRange).toBe('17:00 - 21:30');
    });
  });

  describe('activeWeekTimeSlots (Vista Semana Homologada con Vista Día)', () => {
    const multiSportAvailability: FacilityAvailabilityResponseDto[] = [
      {
        facilityId: 'padel-1',
        facilityName: 'Pádel 1 Cristal',
        sportType: 'PADEL' as any,
        courtType: 'INDOOR' as any,
        surfaceType: 'CRYSTAL' as any,
        hasLighting: true,
        defaultSlotMinutes: 90,
        slots: [
          { startTime: 'T08:00:00Z', endTime: 'T09:30:00Z', startHourText: '08:00', endHourText: '09:30', status: SlotStatus.AVAILABLE, price: 16, isPeakHour: false, lightSurcharge: 2 },
          { startTime: 'T09:30:00Z', endTime: 'T11:00:00Z', startHourText: '09:30', endHourText: '11:00', status: SlotStatus.AVAILABLE, price: 16, isPeakHour: false, lightSurcharge: 2 },
        ],
      },
      {
        facilityId: 'tennis-1',
        facilityName: 'Tenis 1 Tierra',
        sportType: 'TENNIS' as any,
        courtType: 'OUTDOOR' as any,
        surfaceType: 'CLAY' as any,
        hasLighting: false,
        defaultSlotMinutes: 60,
        slots: [
          { startTime: 'T08:00:00Z', endTime: 'T09:00:00Z', startHourText: '08:00', endHourText: '09:00', status: SlotStatus.AVAILABLE, price: 12, isPeakHour: false, lightSurcharge: 0 },
          { startTime: 'T09:00:00Z', endTime: 'T10:00:00Z', startHourText: '09:00', endHourText: '10:00', status: SlotStatus.AVAILABLE, price: 12, isPeakHour: false, lightSurcharge: 0 },
        ],
      },
      {
        facilityId: 'squash-1',
        facilityName: 'Squash 1',
        sportType: 'SQUASH' as any,
        courtType: 'INDOOR' as any,
        surfaceType: 'PARQUET' as any,
        hasLighting: true,
        defaultSlotMinutes: 30,
        slots: [
          { startTime: 'T08:00:00Z', endTime: 'T08:30:00Z', startHourText: '08:00', endHourText: '08:30', status: SlotStatus.AVAILABLE, price: 8, isPeakHour: false, lightSurcharge: 1 },
          { startTime: 'T08:30:00Z', endTime: 'T09:00:00Z', startHourText: '08:30', endHourText: '09:00', status: SlotStatus.AVAILABLE, price: 8, isPeakHour: false, lightSurcharge: 1 },
        ],
      },
    ];

    it('debe devolver solo las franjas de 90 min para la pista activa de pádel sin mezclar franjas de 30 o 60 min', () => {
      component.facilitiesAvailability = multiSportAvailability;
      component.selectedWeekFacilityId = 'padel-1';

      expect(component.activeWeekTimeSlots).toEqual(['08:00 - 09:30', '09:30 - 11:00']);
      // En contraste, uniqueTimeSlots mezclaba todas las franjas
      expect(component.uniqueTimeSlots).toContain('08:00 - 08:30');
      expect(component.uniqueTimeSlots).toContain('08:00 - 09:00');
    });

    it('debe recalcular las franjas reactivamente al cambiar a una pista de tenis de 60 min', () => {
      component.facilitiesAvailability = multiSportAvailability;
      component.selectedWeekFacilityId = 'tennis-1';

      expect(component.activeWeekTimeSlots).toEqual(['08:00 - 09:00', '09:00 - 10:00']);
    });

    it('debe recurrir al fallback del mismo deporte si la pista activa no tiene slots en el payload', () => {
      component.facilitiesAvailability = [
        {
          facilityId: 'padel-2-vacia',
          facilityName: 'Pádel 2 Sin Slots',
          sportType: 'PADEL' as any,
          courtType: 'INDOOR' as any,
          surfaceType: 'CRYSTAL' as any,
          hasLighting: true,
          defaultSlotMinutes: 90,
          slots: [],
        },
        ...multiSportAvailability,
      ];
      component.selectedWeekFacilityId = 'padel-2-vacia';

      // Toma como referencia las franjas de padel-1 que es del mismo deporte
      expect(component.activeWeekTimeSlots).toEqual(['08:00 - 09:30', '09:30 - 11:00']);
    });
  });

  describe('Header Navigation & Date Controls (Rediseño de Layout)', () => {
    it('debe avanzar y retroceder días con nextDay() y prevDay()', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      component.selectedCalendarDate = new Date(today);

      component.nextDay();
      const expectedTomorrow = new Date(today);
      expectedTomorrow.setDate(today.getDate() + 1);
      expect(component.selectedCalendarDate.getDate()).toBe(expectedTomorrow.getDate());

      component.prevDay();
      expect(component.selectedCalendarDate.getDate()).toBe(today.getDate());
    });

    it('debe deshabilitar prevDay() si la fecha actual es igual o menor a minDate', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      component.minDate.setTime(today.getTime());
      component.selectedCalendarDate = new Date(today);

      expect(component.isPrevDayDisabled()).toBe(true);

      component.nextDay();
      expect(component.isPrevDayDisabled()).toBe(false);
    });

    it('debe detectar correctamente si mañana está seleccionado con isTomorrowSelected()', () => {
      component.setTomorrow();
      expect(component.isTomorrowSelected()).toBe(true);
      expect(component.isTodaySelected()).toBe(false);

      component.setToday();
      expect(component.isTomorrowSelected()).toBe(false);
      expect(component.isTodaySelected()).toBe(true);
    });

    it('debe actualizar la semana al seleccionar una fecha con onWeekDateChange()', () => {
      const targetDate = new Date(2026, 9, 28); // Miércoles 28 de octubre 2026
      component.onWeekDateChange(targetDate);

      // El lunes de esa semana es el 26 de octubre 2026
      expect(component.selectedWeekStart.getDate()).toBe(26);
      expect(component.selectedWeekStart.getMonth()).toBe(9);
    });

    it('debe actualizar el mes al invocar onMonthDateChange() y formatearlo en español', () => {
      const targetMonth = new Date(2026, 10, 1); // Noviembre 2026
      component.onMonthDateChange(targetMonth);

      expect(component.selectedMonthDate.getMonth()).toBe(10);
      expect(component.formattedMonthLabel).toContain('Noviembre');
      expect(component.formattedMonthLabel).toContain('2026');
    });
  });
});

