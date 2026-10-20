import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  BookingsService,
  FacilitiesService,
  FacilityAvailabilityResponseDto,
  NotificationService,
  TimeSlotAvailabilityDto,
  TimeSlotAvailabilityDtoStatus as SlotStatus,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-bookings-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    CurrencyPipe,
    ButtonModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    CheckboxModule,
    TagModule,
  ],
  templateUrl: './bookings-grid.component.html',
  styleUrls: ['./bookings-grid.component.scss'],
})
export class BookingsGridComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facilitiesService = inject(FacilitiesService);
  private readonly bookingsService = inject(BookingsService);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  loading = false;
  bookingInProgress = false;
  selectedDate: string = this.getTodayDateString();
  selectedSport: string | null = null;

  facilitiesAvailability: FacilityAvailabilityResponseDto[] = [];

  // Modal de confirmación
  displayConfirmModal = false;
  selectedFacility: FacilityAvailabilityResponseDto | null = null;
  selectedSlot: TimeSlotAvailabilityDto | null = null;

  bookingForm: FormGroup = this.fb.group({
    lightIncluded: [false],
    notes: [''],
  });

  get sportFilterOptions() {
    return [
      { label: this.translate.instant('PORTAL.BOOKINGS.FILTER_ALL_SPORTS'), value: null },
      { label: 'Pádel', value: 'PADEL' },
      { label: 'Tenis', value: 'TENNIS' },
      { label: 'Fútbol 7', value: 'FOOTBALL_7' },
      { label: 'Fútbol 11', value: 'FOOTBALL_11' },
      { label: 'Baloncesto', value: 'BASKETBALL' },
    ];
  }

  ngOnInit(): void {
    this.loadAvailability();
  }

  loadAvailability(): void {
    this.loading = true;
    this.facilitiesService
      .facilitiesControllerGetAvailability({
        date: this.selectedDate,
        sportType: (this.selectedSport as any) || undefined,
      })
      .subscribe({
        next: (data) => {
          this.facilitiesAvailability = data;
          this.loading = false;
        },
        error: () => {
          this.notify.error('ERRORS.SERVER_ERROR');
          this.loading = false;
        },
      });
  }

  onDateChange(newDate: string): void {
    this.selectedDate = newDate;
    this.loadAvailability();
  }

  onSportChange(event: any): void {
    this.selectedSport = event.value;
    this.loadAvailability();
  }

  selectSlot(facility: FacilityAvailabilityResponseDto, slot: TimeSlotAvailabilityDto): void {
    if (slot.status !== SlotStatus.AVAILABLE) return;

    this.selectedFacility = facility;
    this.selectedSlot = slot;
    this.bookingForm.reset({
      lightIncluded: false,
      notes: '',
    });
    this.displayConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.displayConfirmModal = false;
    this.selectedFacility = null;
    this.selectedSlot = null;
  }

  confirmBooking(): void {
    if (!this.selectedFacility || !this.selectedSlot) return;

    this.bookingInProgress = true;
    const formVal = this.bookingForm.value;

    this.bookingsService
      .bookingsControllerCreate({
        facilityId: this.selectedFacility.facilityId,
        startTime: this.selectedSlot.startTime,
        endTime: this.selectedSlot.endTime,
        lightIncluded: formVal.lightIncluded ?? false,
        notes: formVal.notes ? formVal.notes.trim() : undefined,
      })
      .subscribe({
        next: () => {
          this.notify.success('PORTAL.BOOKINGS.SUCCESS_CREATE');
          this.bookingInProgress = false;
          this.displayConfirmModal = false;
          this.router.navigate(['/portal/my-bookings']);
        },
        error: (err) => {
          this.bookingInProgress = false;
          if (err.status === 409) {
            this.notify.error('La franja horaria seleccionada ya ha sido ocupada. Por favor, elige otra.');
            this.closeConfirmModal();
            this.loadAvailability();
          } else {
            this.notify.error('ERRORS.SERVER_ERROR');
          }
        },
      });
  }

  calculateTotalModalPrice(): number {
    if (!this.selectedSlot) return 0;
    let total = this.selectedSlot.price;
    if (this.bookingForm.get('lightIncluded')?.value && this.selectedFacility?.hasLighting) {
      total += this.selectedSlot.lightSurcharge;
    }
    return total;
  }

  getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  isTodaySelected(): boolean {
    return this.selectedDate === this.getTodayDateString();
  }

  setToday(): void {
    this.onDateChange(this.getTodayDateString());
  }

  setTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    this.onDateChange(`${yyyy}-${mm}-${dd}`);
  }
}
