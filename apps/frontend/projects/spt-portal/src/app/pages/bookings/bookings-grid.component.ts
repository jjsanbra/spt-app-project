import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

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
      { label: this.translate.instant('SPORTS.PADEL'), value: 'PADEL' },
      { label: this.translate.instant('SPORTS.TENNIS'), value: 'TENNIS' },
      { label: this.translate.instant('SPORTS.FOOTBALL_7'), value: 'FOOTBALL_7' },
      { label: this.translate.instant('SPORTS.FOOTBALL_11'), value: 'FOOTBALL_11' },
      { label: this.translate.instant('SPORTS.FUTSAL'), value: 'FUTSAL' },
      { label: this.translate.instant('SPORTS.BASKETBALL'), value: 'BASKETBALL' },
      { label: this.translate.instant('SPORTS.PICKLEBALL'), value: 'PICKLEBALL' },
      { label: this.translate.instant('SPORTS.SQUASH'), value: 'SQUASH' },
      { label: this.translate.instant('SPORTS.BADMINTON'), value: 'BADMINTON' },
      { label: this.translate.instant('SPORTS.VOLLEYBALL'), value: 'VOLLEYBALL' },
      { label: this.translate.instant('SPORTS.BEACH_VOLLEY'), value: 'BEACH_VOLLEY' },
      { label: this.translate.instant('SPORTS.FRONTON'), value: 'FRONTON' },
      { label: this.translate.instant('SPORTS.INDOOR_FRONTON'), value: 'INDOOR_FRONTON' },
      { label: this.translate.instant('SPORTS.HANDBALL'), value: 'HANDBALL' },
      { label: this.translate.instant('SPORTS.TABLE_TENNIS'), value: 'TABLE_TENNIS' },
      { label: this.translate.instant('SPORTS.ATHLETICS_TRACK'), value: 'ATHLETICS_TRACK' },
      { label: this.translate.instant('SPORTS.SWIMMING_LANE'), value: 'SWIMMING_LANE' },
      { label: this.translate.instant('SPORTS.CLIMBING_WALL'), value: 'CLIMBING_WALL' },
      { label: this.translate.instant('SPORTS.MULTI_SPORT'), value: 'MULTI_SPORT' },
    ];
  }

  ngOnInit(): void {
    this.loadAvailability();
  }

  loadAvailability(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.facilitiesService
      .facilitiesControllerGetAvailability({
        date: this.selectedDate,
        sportType: (this.selectedSport as any) || undefined,
      })
      .subscribe({
        next: (data) => {
          this.facilitiesAvailability = data;
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
    this.cdr.markForCheck();
  }

  closeConfirmModal(): void {
    this.displayConfirmModal = false;
    this.selectedFacility = null;
    this.selectedSlot = null;
    this.cdr.markForCheck();
  }

  confirmBooking(): void {
    if (!this.selectedFacility || !this.selectedSlot) return;

    this.bookingInProgress = true;
    this.cdr.markForCheck();
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
          this.cdr.markForCheck();
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
          this.cdr.markForCheck();
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
