import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  BookingsService,
  FacilitiesService,
  FacilityAvailabilityResponseDto,
  NotificationService,
  TimeSlotAvailabilityDto,
  TimeSlotAvailabilityDtoStatus as SlotStatus,
  PageHeaderComponent,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export interface SportGridGroup {
  sportType: string;
  sportLabel: string;
  defaultSlotMinutes: number;
  facilities: FacilityAvailabilityResponseDto[];
  timeSlots: string[];
  peakHoursRange: string | null;
}

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
    PageHeaderComponent,
    ButtonModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    CheckboxModule,
    TagModule,
    DatePickerModule,
    SelectButtonModule,
    TooltipModule,
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
  readonly authService = inject(AuthService);

  loading = false;
  bookingInProgress = false;
  selectedDate: string = this.getTodayDateString();
  selectedCalendarDate: Date = new Date();
  readonly minDate: Date = new Date();
  selectedSport: string | null = null;
  viewMode: 'grid' | 'cards' = 'grid';
  calendarGranularity: 'day' | 'week' | 'month' = 'day';

  selectedWeekStart: Date = this.getMonday(new Date());
  selectedWeekFacilityId: string | null = null;
  selectedMonthDate: Date = new Date();

  facilitiesAvailability: FacilityAvailabilityResponseDto[] = [];

  // Modal de confirmación
  displayConfirmModal = false;
  selectedFacility: FacilityAvailabilityResponseDto | null = null;
  selectedSlot: TimeSlotAvailabilityDto | null = null;

  bookingForm: FormGroup = this.fb.group({
    lightIncluded: [false],
    notes: [''],
  });

  get granularityOptions() {
    return [
      { label: this.translate.instant('PORTAL.BOOKINGS.GRANULARITY_DAY'), value: 'day', icon: 'pi pi-calendar' },
      { label: this.translate.instant('PORTAL.BOOKINGS.GRANULARITY_WEEK'), value: 'week', icon: 'pi pi-calendar-plus' },
      { label: this.translate.instant('PORTAL.BOOKINGS.GRANULARITY_MONTH'), value: 'month', icon: 'pi pi-table' },
    ];
  }

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

  get viewModeOptions() {
    return [
      { label: this.translate.instant('PORTAL.BOOKINGS.VIEW_GRID'), value: 'grid', icon: 'pi pi-table' },
      { label: this.translate.instant('PORTAL.BOOKINGS.VIEW_CARDS'), value: 'cards', icon: 'pi pi-list' },
    ];
  }

  get facilitySelectOptions() {
    return this.facilitiesAvailability.map((f) => ({
      label: `${f.facilityName} (${f.sportType})`,
      value: f.facilityId,
    }));
  }

  get activeWeekFacility(): FacilityAvailabilityResponseDto | undefined {
    if (!this.facilitiesAvailability.length) return undefined;
    if (this.selectedWeekFacilityId) {
      const found = this.facilitiesAvailability.find((f) => f.facilityId === this.selectedWeekFacilityId);
      if (found) return found;
    }
    return this.facilitiesAvailability[0];
  }

  get weekDays(): { date: Date; dateString: string; label: string; isToday: boolean }[] {
    const days: { date: Date; dateString: string; label: string; isToday: boolean }[] = [];
    const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.selectedWeekStart);
      d.setDate(d.getDate() + i);
      const dateString = this.formatDate(d);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      days.push({
        date: d,
        dateString,
        label: `${dayNames[i]} ${dd}/${mm}`,
        isToday: dateString === this.getTodayDateString(),
      });
    }
    return days;
  }

  get monthDays(): { date: Date; dateString: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] {
    const year = this.selectedMonthDate.getFullYear();
    const month = this.selectedMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: Date; dateString: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6;
    for (let i = startOffset; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({
        date: prevDate,
        dateString: this.formatDate(prevDate),
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: this.formatDate(prevDate) === this.getTodayDateString(),
      });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const currDate = new Date(year, month, d);
      days.push({
        date: currDate,
        dateString: this.formatDate(currDate),
        dayNumber: d,
        isCurrentMonth: true,
        isToday: this.formatDate(currDate) === this.getTodayDateString(),
      });
    }

    let extra = 1;
    while (days.length % 7 !== 0) {
      const nextDate = new Date(year, month + 1, extra++);
      days.push({
        date: nextDate,
        dateString: this.formatDate(nextDate),
        dayNumber: nextDate.getDate(),
        isCurrentMonth: false,
        isToday: this.formatDate(nextDate) === this.getTodayDateString(),
      });
    }

    return days;
  }


  get sportGridGroups(): SportGridGroup[] {
    if (!this.facilitiesAvailability.length) return [];

    const groupsMap = new Map<string, FacilityAvailabilityResponseDto[]>();
    for (const facility of this.facilitiesAvailability) {
      const sport = facility.sportType;
      if (!groupsMap.has(sport)) {
        groupsMap.set(sport, []);
      }
      groupsMap.get(sport)!.push(facility);
    }

    const result: SportGridGroup[] = [];
    for (const [sportType, facilities] of groupsMap.entries()) {
      const slotsSet = new Set<string>();
      for (const f of facilities) {
        if (f.slots) {
          for (const s of f.slots) {
            slotsSet.add(`${s.startHourText} - ${s.endHourText}`);
          }
        }
      }
      const timeSlots = Array.from(slotsSet).sort((a, b) => a.localeCompare(b));
      const sportOption = this.sportFilterOptions.find((o) => o.value === sportType);
      const defaultSlotMinutes = facilities[0]?.defaultSlotMinutes || 60;

      // Calcular rango de horas punta a partir de los slots configurados
      const peakSlots = facilities
        .flatMap((f) => f.slots || [])
        .filter((s) => s.isPeakHour);

      let peakHoursRange: string | null = null;
      if (peakSlots.length > 0) {
        const startTimes = Array.from(new Set(peakSlots.map((s) => s.startHourText))).sort();
        const endTimes = Array.from(new Set(peakSlots.map((s) => s.endHourText))).sort();
        const earliestStart = startTimes[0];
        const latestEnd = endTimes[endTimes.length - 1];
        peakHoursRange = `${earliestStart} - ${latestEnd}`;
      }

      result.push({
        sportType,
        sportLabel: sportOption ? sportOption.label : sportType,
        defaultSlotMinutes,
        facilities,
        timeSlots,
        peakHoursRange,
      });
    }

    return result;
  }

  get uniqueTimeSlots(): string[] {
    const slotsSet = new Set<string>();
    for (const facility of this.facilitiesAvailability) {
      if (facility.slots) {
        for (const slot of facility.slots) {
          slotsSet.add(`${slot.startHourText} - ${slot.endHourText}`);
        }
      }
    }
    return Array.from(slotsSet).sort((a, b) => a.localeCompare(b));
  }

  get activeWeekTimeSlots(): string[] {
    const facility = this.activeWeekFacility;
    if (!facility) return [];

    const slotsSet = new Set<string>();
    if (facility.slots && facility.slots.length > 0) {
      for (const slot of facility.slots) {
        slotsSet.add(`${slot.startHourText} - ${slot.endHourText}`);
      }
    } else {
      // Fallback: si la pista seleccionada no tiene slots en el payload, buscar pistas del mismo deporte
      const sameSportFacilities = this.facilitiesAvailability.filter(
        (f) => f.sportType === facility.sportType,
      );
      for (const f of sameSportFacilities) {
        if (f.slots) {
          for (const s of f.slots) {
            slotsSet.add(`${s.startHourText} - ${s.endHourText}`);
          }
        }
      }
    }
    return Array.from(slotsSet).sort((a, b) => a.localeCompare(b));
  }

  getSlotForFacilityAndTime(
    facility: FacilityAvailabilityResponseDto,
    timeRange: string,
  ): TimeSlotAvailabilityDto | undefined {
    return facility.slots?.find(
      (slot) => `${slot.startHourText} - ${slot.endHourText}` === timeRange,
    );
  }

  ngOnInit(): void {
    this.minDate.setHours(0, 0, 0, 0);
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

  onDatePickerChange(date: Date | null): void {
    if (!date) return;
    this.selectedCalendarDate = date;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    this.selectedDate = `${yyyy}-${mm}-${dd}`;
    this.loadAvailability();
  }

  onDateChange(newDate: string): void {
    this.selectedDate = newDate;
    const [y, m, d] = newDate.split('-').map(Number);
    if (y && m && d) {
      this.selectedCalendarDate = new Date(y, m - 1, d);
    }
    this.loadAvailability();
  }

  onSportChange(event: any): void {
    this.selectedSport = event.value;
    this.loadAvailability();
  }

  isSlotBlockedByCutoff(dateStr: string, startHourText: string): boolean {
    if (!dateStr || !startHourText) return false;
    const [hours, minutes] = startHourText.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day || isNaN(hours) || isNaN(minutes)) return false;

    // Fecha y hora del slot a evaluar
    const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Para roles privilegiados (OWNER o SUPER_ADMIN): la única restricción es que no pueden reservar a pasado
    if (this.authService.isOwnerOrSuperAdmin()) {
      return slotDateTime.getTime() < Date.now();
    }

    // Para otros roles: margen de 2 horas desde el instante actual
    const cutoffTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return slotDateTime.getTime() < cutoffTime.getTime();
  }

  getCutoffTooltip(): string {
    return this.authService.isOwnerOrSuperAdmin()
      ? this.translate.instant('PORTAL.BOOKINGS.SLOT_PAST_TOOLTIP')
      : this.translate.instant('PORTAL.BOOKINGS.SLOT_CUTOFF_TOOLTIP');
  }

  isSlotBookable(dateStr: string, slot: TimeSlotAvailabilityDto | undefined): boolean {
    if (!slot || slot.status !== SlotStatus.AVAILABLE) return false;
    return !this.isSlotBlockedByCutoff(dateStr, slot.startHourText);
  }

  selectSlot(
    facility: FacilityAvailabilityResponseDto,
    slot: TimeSlotAvailabilityDto,
    targetDate: string = this.selectedDate,
  ): void {
    if (slot.status !== SlotStatus.AVAILABLE) return;

    if (this.isSlotBlockedByCutoff(targetDate, slot.startHourText)) {
      if (this.authService.isOwnerOrSuperAdmin()) {
        this.notify.warn('PORTAL.BOOKINGS.ERR_PAST_DATE');
      } else {
        this.notify.warn('PORTAL.BOOKINGS.ERR_CUTOFF_LIMIT');
      }
      return;
    }

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
    if (this.authService.isOwnerOrSuperAdmin()) return 0;
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

  isTomorrowSelected(): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.selectedDate === this.formatDate(tomorrow);
  }

  isPrevDayDisabled(): boolean {
    if (!this.selectedCalendarDate) return false;
    const current = new Date(this.selectedCalendarDate);
    current.setHours(0, 0, 0, 0);
    return current.getTime() <= this.minDate.getTime();
  }

  setToday(): void {
    this.onDateChange(this.getTodayDateString());
  }

  setTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.onDateChange(this.formatDate(tomorrow));
  }

  prevDay(): void {
    if (this.isPrevDayDisabled()) return;
    const d = new Date(this.selectedCalendarDate);
    d.setDate(d.getDate() - 1);
    this.onDatePickerChange(d);
  }

  nextDay(): void {
    const d = new Date(this.selectedCalendarDate);
    d.setDate(d.getDate() + 1);
    this.onDatePickerChange(d);
  }

  formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  prevWeek(): void {
    const d = new Date(this.selectedWeekStart);
    d.setDate(d.getDate() - 7);
    this.selectedWeekStart = d;
    this.cdr.markForCheck();
  }

  nextWeek(): void {
    const d = new Date(this.selectedWeekStart);
    d.setDate(d.getDate() + 7);
    this.selectedWeekStart = d;
    this.cdr.markForCheck();
  }

  currentWeek(): void {
    this.selectedWeekStart = this.getMonday(new Date());
    this.cdr.markForCheck();
  }

  onWeekDateChange(date: Date | null): void {
    if (!date) return;
    this.selectedWeekStart = this.getMonday(date);
    this.cdr.markForCheck();
  }

  prevMonth(): void {
    const d = new Date(this.selectedMonthDate);
    d.setMonth(d.getMonth() - 1);
    this.selectedMonthDate = d;
    this.cdr.markForCheck();
  }

  onMonthDateChange(date: Date | null): void {
    if (!date) return;
    this.selectedMonthDate = date;
    this.cdr.markForCheck();
  }

  get formattedMonthLabel(): string {
    const d = this.selectedMonthDate || new Date();
    const str = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  get formattedWeekRangeLabel(): string {
    if (!this.weekDays || this.weekDays.length < 7) return '';
    return `${this.weekDays[0].label} — ${this.weekDays[6].label}`;
  }

  nextMonth(): void {
    const d = new Date(this.selectedMonthDate);
    d.setMonth(d.getMonth() + 1);
    this.selectedMonthDate = d;
    this.cdr.markForCheck();
  }

  currentMonth(): void {
    this.selectedMonthDate = new Date();
    this.cdr.markForCheck();
  }

  goToDayFromMonth(date: Date): void {
    this.calendarGranularity = 'day';
    this.onDatePickerChange(date);
  }

  onEmptySlotClick(
    facility: FacilityAvailabilityResponseDto,
    timeRange: string,
    targetDate: string = this.selectedDate,
  ): void {
    const [startHourText] = timeRange.split(' - ');
    if (!startHourText) return;

    if (this.isSlotBlockedByCutoff(targetDate, startHourText)) {
      this.notify.warn('PORTAL.BOOKINGS.ERR_CUTOFF_LIMIT');
      return;
    }

    const [hoursStr, minutesStr] = startHourText.split(':');
    const startHour = parseInt(hoursStr, 10);
    const startMinute = parseInt(minutesStr, 10);
    const durationMinutes = facility.defaultSlotMinutes || 60;

    const startMinutesTotal = startHour * 60 + startMinute;
    let endMinutesTotal = startMinutesTotal + durationMinutes;

    // Controlar que no se exceda el tiempo disponible si hay un slot posterior en esa pista
    if (facility.slots && facility.slots.length > 0) {
      for (const existingSlot of facility.slots) {
        const [eHourStr, eMinStr] = existingSlot.startHourText.split(':');
        const existingSlotStartTotal = parseInt(eHourStr, 10) * 60 + parseInt(eMinStr, 10);
        if (existingSlotStartTotal > startMinutesTotal && existingSlotStartTotal < endMinutesTotal) {
          endMinutesTotal = existingSlotStartTotal;
        }
      }
    }

    // No exceder medianoche (24:00 = 1440 min)
    if (endMinutesTotal > 1440) {
      endMinutesTotal = 1440;
    }

    // Si tras el ajuste la duración es inferior a 30 min, avisar al usuario
    if (endMinutesTotal - startMinutesTotal < 30) {
      this.notify.warn('PORTAL.BOOKINGS.TIME_NOT_AVAILABLE');
      return;
    }

    const endHour = Math.floor(endMinutesTotal / 60);
    const endMin = endMinutesTotal % 60;
    const endHourText = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const startTimeIso = `${targetDate}T${startHourText}:00.000Z`;
    const endTimeIso = `${targetDate}T${endHourText}:00.000Z`;

    const virtualSlot: TimeSlotAvailabilityDto = {
      startTime: startTimeIso,
      endTime: endTimeIso,
      startHourText,
      endHourText,
      status: SlotStatus.AVAILABLE,
      price: facility.slots?.[0]?.price ?? 16.0,
      isPeakHour: false,
      lightSurcharge: facility.slots?.[0]?.lightSurcharge ?? 2.0,
    };

    this.selectSlot(facility, virtualSlot, targetDate);
  }
}
