import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  BookingResponseDto,
  BookingResponseDtoBookingType as BookingType,
  BookingResponseDtoStatus as BookingStatus,
  BookingsService,
  ConfirmDialogService,
  NotificationService,
} from '@core';
import { of, throwError } from 'rxjs';
import { MyBookingsComponent } from './my-bookings.component';

describe('MyBookingsComponent', () => {
  let component: MyBookingsComponent;
  let fixture: ComponentFixture<MyBookingsComponent>;
  let mockBookingsService: any;
  let mockNotify: any;
  let mockConfirmService: any;

  const mockBookings: BookingResponseDto[] = [
    {
      id: 'book-1',
      clubId: 'club-1',
      facilityId: 'fac-1',
      userId: 'user-1',
      bookingType: BookingType.FULL,
      startTime: new Date(Date.now() + 86400000).toISOString() as any,
      endTime: new Date(Date.now() + 90000000).toISOString() as any,
      totalPrice: 18.0,
      lightIncluded: true,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date().toISOString() as any,
      facility: {
        id: 'fac-1',
        name: 'Pista 1 Central',
        sportType: 'PADEL' as any,
      },
    },
    {
      id: 'book-2',
      clubId: 'club-1',
      facilityId: 'fac-2',
      userId: 'user-1',
      bookingType: BookingType.FULL,
      startTime: new Date(Date.now() - 86400000).toISOString() as any,
      endTime: new Date(Date.now() - 82800000).toISOString() as any,
      totalPrice: 20.0,
      lightIncluded: false,
      status: BookingStatus.CANCELLED,
      createdAt: new Date().toISOString() as any,
      facility: {
        id: 'fac-2',
        name: 'Pista 2 Tenis',
        sportType: 'TENNIS' as any,
      },
    },
  ];

  beforeEach(async () => {
    mockBookingsService = {
      bookingsControllerFindMyBookings: vi.fn().mockReturnValue(of(mockBookings)),
      bookingsControllerCancel: vi.fn().mockReturnValue(of({ ...mockBookings[0], status: BookingStatus.CANCELLED })),
    };

    mockNotify = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockConfirmService = {
      confirm: vi.fn().mockImplementation((config: any) => {
        if (config.onAccept) {
          config.onAccept();
        }
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MyBookingsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService(),
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: NotificationService, useValue: mockNotify },
        { provide: ConfirmDialogService, useValue: mockConfirmService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyBookingsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user bookings on init', () => {
    fixture.detectChanges();
    expect(mockBookingsService.bookingsControllerFindMyBookings).toHaveBeenCalled();
    expect(component.bookings.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading bookings', () => {
    mockBookingsService.bookingsControllerFindMyBookings.mockReturnValue(
      throwError(() => new Error('Error loading'))
    );
    component.loadBookings();
    expect(mockNotify.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
    expect(component.loading).toBe(false);
  });

  it('should prompt confirmation and cancel booking successfully', () => {
    fixture.detectChanges();
    const targetBooking = mockBookings[0];
    component.confirmCancelBooking(targetBooking);

    expect(mockConfirmService.confirm).toHaveBeenCalled();
    expect(mockBookingsService.bookingsControllerCancel).toHaveBeenCalledWith(
      targetBooking.id,
      { cancellationReason: 'Cancelación solicitada por el usuario' }
    );
    expect(mockNotify.success).toHaveBeenCalledWith('PORTAL.MY_BOOKINGS.SUCCESS_CANCEL');
  });

  it('should notify error if cancel booking fails', () => {
    mockBookingsService.bookingsControllerCancel.mockReturnValue(
      throwError(() => new Error('Error cancelling'))
    );
    fixture.detectChanges();

    component.confirmCancelBooking(mockBookings[0]);
    expect(mockNotify.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
  });

  it('should return correct severity tag depending on booking status', () => {
    expect(component.getStatusSeverity(BookingStatus.CONFIRMED)).toBe('success');
    expect(component.getStatusSeverity(BookingStatus.CANCELLED)).toBe('danger');
    expect(component.getStatusSeverity(BookingStatus.PENDING_CONFIRMATION)).toBe('warn');
  });

  it('should correctly determine if a booking is upcoming', () => {
    const upcoming = mockBookings[0]; // tomorrow + CONFIRMED
    const past = mockBookings[1];     // yesterday + CANCELLED

    expect(component.isUpcoming(upcoming)).toBe(true);
    expect(component.isUpcoming(past)).toBe(false);
  });
});
