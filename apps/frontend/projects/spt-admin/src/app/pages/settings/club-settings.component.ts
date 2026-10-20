import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ClubSettingsResponseDto,
  ClubSettingsResponseDtoPaymentMode as PaymentMode,
  ClubsSettingsService,
  NotificationService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-club-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './club-settings.component.html',
  styleUrls: ['./club-settings.component.scss'],
})
export class ClubSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clubsSettingsService = inject(ClubsSettingsService);
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  saving = false;
  club: ClubSettingsResponseDto | null = null;

  settingsForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    city: [''],
    postalCode: [''],
    openingHour: [8, [Validators.required, Validators.min(0), Validators.max(23)]],
    closingHour: [23, [Validators.required, Validators.min(1), Validators.max(24)]],
    slotDurationMinutes: [60, [Validators.required]],
    openGameMinNoticeHours: [2, [Validators.required, Validators.min(1), Validators.max(72)]],
    paymentMode: [PaymentMode.PRESENTIAL, [Validators.required]],
  });

  get slotDurationOptions() {
    return [
      { label: `30 ${this.translate.instant('ADMIN.SETTINGS.MINUTES')}`, value: 30 },
      { label: `60 ${this.translate.instant('ADMIN.SETTINGS.MINUTES')}`, value: 60 },
      { label: `90 ${this.translate.instant('ADMIN.SETTINGS.MINUTES')}`, value: 90 },
      { label: `120 ${this.translate.instant('ADMIN.SETTINGS.MINUTES')}`, value: 120 },
    ];
  }

  get paymentModeOptions() {
    return [
      {
        label: this.translate.instant('ADMIN.SETTINGS.PAYMENT_MODE_PRESENTIAL'),
        value: PaymentMode.PRESENTIAL,
      },
      {
        label: this.translate.instant('ADMIN.SETTINGS.PAYMENT_MODE_ONLINE'),
        value: PaymentMode.ONLINE,
      },
      {
        label: this.translate.instant('ADMIN.SETTINGS.PAYMENT_MODE_HYBRID'),
        value: PaymentMode.HYBRID,
      },
    ];
  }

  get hourOptions() {
    const hours = [];
    for (let i = 0; i <= 24; i++) {
      hours.push({
        label: `${i.toString().padStart(2, '0')}:00`,
        value: i,
      });
    }
    return hours;
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.clubsSettingsService.clubsControllerGetSettings().subscribe({
      next: (data) => {
        this.club = data;
        this.settingsForm.patchValue({
          name: data.name,
          description: data.description || '',
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          openingHour: data.openingHour,
          closingHour: data.closingHour,
          slotDurationMinutes: data.slotDurationMinutes,
          openGameMinNoticeHours: data.openGameMinNoticeHours,
          paymentMode: data.paymentMode,
        });
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

  submitSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const formVal = this.settingsForm.value;
    if (formVal.openingHour >= formVal.closingHour) {
      this.notify.error('La hora de apertura debe ser anterior a la hora de cierre');
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();
    this.clubsSettingsService
      .clubsControllerUpdateSettings({
        name: formVal.name.trim(),
        description: formVal.description ? formVal.description.trim() : undefined,
        email: formVal.email.trim(),
        phone: formVal.phone ? formVal.phone.trim() : undefined,
        address: formVal.address ? formVal.address.trim() : undefined,
        city: formVal.city ? formVal.city.trim() : undefined,
        postalCode: formVal.postalCode ? formVal.postalCode.trim() : undefined,
        openingHour: formVal.openingHour,
        closingHour: formVal.closingHour,
        slotDurationMinutes: formVal.slotDurationMinutes,
        openGameMinNoticeHours: formVal.openGameMinNoticeHours,
        paymentMode: formVal.paymentMode,
      })
      .subscribe({
        next: (updated) => {
          this.club = updated;
          this.notify.success('ADMIN.SETTINGS.SUCCESS_UPDATE');
          this.saving = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.saving = false;
          if (err.status === 400 && err.error?.message) {
            this.notify.error(err.error.message);
          } else {
            this.notify.error('ERRORS.SERVER_ERROR');
          }
          this.cdr.markForCheck();
        },
      });
  }
}
