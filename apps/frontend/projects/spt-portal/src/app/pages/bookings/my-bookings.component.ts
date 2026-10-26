import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BookingResponseDto,
  BookingResponseDtoStatus as BookingStatus,
  BookingsService,
  ConfirmDialogService,
  NotificationService,
  PageHeaderComponent,
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
    PageHeaderComponent,
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
  private readonly cdr = inject(ChangeDetectorRef);

  bookings: BookingResponseDto[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.bookingsService.bookingsControllerFindMyBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notify.error('ERRORS.SERVER_ERROR');
        this.loading = false;
        this.cdr.markForCheck();
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
            this.cdr.markForCheck();
          },
          error: () => {
            this.notify.error('ERRORS.SERVER_ERROR');
            this.cdr.markForCheck();
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
