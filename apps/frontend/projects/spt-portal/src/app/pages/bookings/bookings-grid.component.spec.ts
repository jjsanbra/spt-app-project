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
});
