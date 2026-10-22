import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  BookingsService,
  FacilitiesService,
  FacilityAvailabilityResponseDto,
  NotificationService,
  TimeSlotAvailabilityDtoStatus as SlotStatus,
} from '@core';
import { of, throwError } from 'rxjs';
import { BookingsGridComponent } from './bookings-grid.component';

describe('BookingsGridComponent', () => {
  let component: BookingsGridComponent;
  let fixture: ComponentFixture<BookingsGridComponent>;
  let mockFacilitiesService: any;
  let mockBookingsService: any;
  let mockNotify: any;

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
      bookingsControllerCreate: vi.fn().mockReturnValue(of({ id: 'book-1' })),
    };

    mockNotify = {
      success: vi.fn(),
      error: vi.fn(),
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    const facility = component.facilitiesAvailability[0];
    component.selectSlot(facility, facility.slots[0]);
    component.confirmBooking();

    expect(mockNotify.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
    expect(component.bookingInProgress).toBe(false);
  });
});

