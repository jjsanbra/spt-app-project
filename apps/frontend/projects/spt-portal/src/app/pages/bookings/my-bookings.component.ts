import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BookingResponseDto,
  BookingResponseDtoStatus as BookingStatus,
  BookingsService,
  ConfirmDialogService,
  NotificationService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    CurrencyPipe,
    DatePipe,
    ButtonModule,
    TagModule,
  ],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss'],
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);

  bookings: BookingResponseDto[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingsService.bookingsControllerFindMyBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => {
        this.notify.error('ERRORS.SERVER_ERROR');
        this.loading = false;
      },
    });
  }

  confirmCancelBooking(booking: BookingResponseDto): void {
    this.confirmService.confirm({
      headerKey: 'PORTAL.MY_BOOKINGS.CONFIRM_CANCEL_TITLE',
      messageKey: 'PORTAL.MY_BOOKINGS.CONFIRM_CANCEL_MSG',
      severity: 'danger',
      onAccept: () => {
        this.bookingsService
          .bookingsControllerCancel(booking.id, {
            cancellationReason: 'Cancelación solicitada por el usuario',
          })
          .subscribe({
          next: () => {
            this.notify.success('PORTAL.MY_BOOKINGS.SUCCESS_CANCEL');
            this.loadBookings();
          },
          error: () => {
            this.notify.error('ERRORS.SERVER_ERROR');
          },
        });
      },
    });
  }

  getStatusSeverity(status: BookingStatus): 'success' | 'danger' | 'warn' | 'secondary' {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'success';
      case BookingStatus.CANCELLED:
        return 'danger';
      case BookingStatus.PENDING_CONFIRMATION:
        return 'warn';
      default:
        return 'secondary';
    }
  }

  isUpcoming(booking: BookingResponseDto): boolean {
    return new Date(booking.startTime) > new Date() && booking.status === BookingStatus.CONFIRMED;
  }
}
