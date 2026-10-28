import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ClubSettingsResponseDto,
  ClubSettingsResponseDtoPaymentMode as PaymentMode,
  ClubsSettingsService,
  NotificationService,
  PageHeaderComponent,
  SuperadminClubsService,
} from '@core';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

export interface ManagedClubRow {
  clubId: string;
  name: string;
  slug: string;
  city?: string;
  role: string;
}

@Component({
  selector: 'app-club-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    SharedModule,
    ButtonModule,
    TableModule,
    DialogModule,
    TagModule,
    TooltipModule,
    FloatLabel,
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
  readonly authService = inject(AuthService);
  private readonly clubsSettingsService = inject(ClubsSettingsService);
  private readonly superadminClubsService = inject(SuperadminClubsService, { optional: true });
  private readonly notify = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  managedClubs: ManagedClubRow[] = [];
  loading = false;
  loadingModal = false;
  saving = false;

  constructor() {
    effect(() => {
      // Reacciona cuando currentUser cambia o se carga asíncronamente
      const user = this.authService.currentUser();
      if (user) {
        this.loadManagedClubs();
      }
    });
  }
  displayModal = false;
  selectedClub: ManagedClubRow | null = null;
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

  get modalHeader(): string {
    if (!this.selectedClub) {
      return this.translate.instant('ADMIN.SETTINGS.MODAL_TITLE');
    }
    return `${this.translate.instant('ADMIN.SETTINGS.MODAL_TITLE')} — ${this.selectedClub.name}`;
  }

  ngOnInit(): void {
    this.loadManagedClubs();
  }

  loadManagedClubs(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const isSuper = this.authService.isSuperAdmin?.() ?? false;

    if (isSuper && this.superadminClubsService) {
      this.superadminClubsService.superAdminClubsControllerFindAll().subscribe({
        next: (res) => {
          const items = res?.items || [];
          if (items.length > 0) {
            this.managedClubs = items.map((c) => ({
              clubId: c.id,
              name: c.name,
              slug: c.slug,
              city: c.city || undefined,
              role: 'SUPERADMIN',
            }));
          } else {
            this.fallbackToMemberships();
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.fallbackToMemberships();
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.fallbackToMemberships();
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private fallbackToMemberships(): void {
    const memberships = this.authService.userMemberships?.() || [];
    const adminRoles = ['OWNER', 'ADMIN'];
    const filtered = memberships.filter((m) => adminRoles.includes(m.role));

    if (filtered.length > 0) {
      this.managedClubs = filtered.map((m) => ({
        clubId: m.clubId,
        name: m.clubName,
        slug: m.clubSlug,
        city: m.clubCity || undefined,
        role: m.role,
      }));
    } else if (memberships.length > 0) {
      this.managedClubs = memberships.map((m) => ({
        clubId: m.clubId,
        name: m.clubName,
        slug: m.clubSlug,
        city: m.clubCity || undefined,
        role: m.role,
      }));
    } else {
      const active = this.authService.activeClub?.();
      if (active) {
        this.managedClubs = [
          {
            clubId: active.clubId,
            name: active.clubName,
            slug: active.clubSlug,
            city: active.clubCity || undefined,
            role: active.role,
          },
        ];
      } else {
        this.managedClubs = [];
      }
    }
  }

  openConfigureModal(club: ManagedClubRow): void {
    this.selectedClub = club;
    this.displayModal = true;
    this.loadSettings(club.clubId);
  }

  onCloseModal(): void {
    this.displayModal = false;
    this.selectedClub = null;
    this.loadingModal = false;
    this.cdr.markForCheck();
  }

  loadSettings(clubId?: string): void {
    const targetId =
      clubId ||
      this.selectedClub?.clubId ||
      this.authService.activeClub?.()?.clubId ||
      '';

    this.loadingModal = true;
    this.cdr.markForCheck();

    const options = targetId ? { headers: { 'x-tenant-id': targetId } } : undefined;

    this.clubsSettingsService.clubsControllerGetSettings(options).subscribe({
      next: (data) => {
        this.club = data;
        const descriptionStr = typeof data.description === 'string' ? data.description : '';
        const phoneStr = typeof data.phone === 'string' ? data.phone : '';
        const addressStr = typeof data.address === 'string' ? data.address : '';
        const cityStr = typeof data.city === 'string' ? data.city : '';
        const postalCodeStr = typeof data.postalCode === 'string' ? data.postalCode : '';

        this.settingsForm.patchValue({
          name: data.name,
          description: descriptionStr,
          email: data.email,
          phone: phoneStr,
          address: addressStr,
          city: cityStr,
          postalCode: postalCodeStr,
          openingHour: data.openingHour,
          closingHour: data.closingHour,
          slotDurationMinutes: data.slotDurationMinutes,
          openGameMinNoticeHours: data.openGameMinNoticeHours,
          paymentMode: data.paymentMode,
        });
        this.loadingModal = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notify.error('ERRORS.SERVER_ERROR');
        this.loadingModal = false;
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

    const targetId =
      this.selectedClub?.clubId ||
      this.authService.activeClub?.()?.clubId ||
      '';

    this.saving = true;
    this.cdr.markForCheck();

    const options = targetId ? { headers: { 'x-tenant-id': targetId } } : undefined;

    this.clubsSettingsService
      .clubsControllerUpdateSettings(
        {
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
        },
        options,
      )
      .subscribe({
        next: (updated) => {
          this.club = updated;
          if (this.selectedClub) {
            this.selectedClub.name = updated.name;
            const updatedCity = typeof updated.city === 'string' ? updated.city : undefined;
            this.selectedClub.city = updatedCity;
          }
          this.notify.success('ADMIN.SETTINGS.SUCCESS_UPDATE');
          this.saving = false;
          this.displayModal = false;
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

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (role) {
      case 'SUPERADMIN':
      case 'OWNER':
        return 'danger';
      case 'ADMIN':
        return 'warn';
      case 'STAFF':
        return 'info';
      case 'MEMBER':
      case 'PLAYER':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
