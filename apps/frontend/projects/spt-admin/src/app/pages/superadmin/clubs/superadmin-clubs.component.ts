import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  CreateClubDto,
  CreateClubDtoPaymentMode,
  NotificationService,
  SuperAdminClubResponseDto,
  SuperadminClubsService,
  UpdateSuperAdminClubDto,
  PageHeaderComponent,
} from '@core';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-superadmin-clubs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    SharedModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    FloatLabel,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TooltipModule,
  ],
  templateUrl: './superadmin-clubs.component.html',
  styleUrls: ['./superadmin-clubs.component.scss'],
})
export class SuperAdminClubsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly superAdminService = inject(SuperadminClubsService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  clubs: SuperAdminClubResponseDto[] = [];
  loading = false;
  saving = false;
  displayModal = false;
  isEditing = false;
  selectedClubId: string | null = null;

  searchFilter = '';
  statusFilter: boolean | undefined = undefined;

  get paymentModes() {
    return [
      { label: this.translate.instant('ADMIN.SETTINGS.PAYMENT_MODE_PRESENTIAL'), value: 'PRESENTIAL' },
      { label: this.translate.instant('ADMIN.SETTINGS.PAYMENT_MODE_ONLINE'), value: 'ONLINE' },
      { label: this.translate.instant('ADMIN.SETTINGS.PAYMENT_MODE_HYBRID'), value: 'HYBRID' },
    ];
  }

  get statusOptions() {
    return [
      { label: this.translate.instant('SUPERADMIN.CLUBS.STATUS_ALL'), value: undefined },
      { label: this.translate.instant('SUPERADMIN.CLUBS.STATUS_ACTIVE'), value: true },
      { label: this.translate.instant('SUPERADMIN.CLUBS.STATUS_INACTIVE'), value: false },
    ];
  }

  readonly clubForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    email: ['', [Validators.required, Validators.email]],
    description: [''],
    phone: [''],
    address: [''],
    city: [''],
    postalCode: [''],
    openingHour: [8, [Validators.required, Validators.min(0), Validators.max(23)]],
    closingHour: [23, [Validators.required, Validators.min(1), Validators.max(24)]],
    slotDurationMinutes: [60, [Validators.required]],
    paymentMode: ['PRESENTIAL', [Validators.required]],
    ownerEmail: ['', [Validators.email]],
  });

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.superAdminService
      .superAdminClubsControllerFindAll({
        search: this.searchFilter || undefined,
        isActive: this.statusFilter,
      })
      .subscribe({
        next: (res) => {
          this.clubs = res.items;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.notify.error('ERRORS.GENERIC');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSearchChange(): void {
    this.loadClubs();
  }

  onStatusFilterChange(val: boolean | undefined): void {
    this.statusFilter = val;
    this.loadClubs();
  }

  // Generar automáticamente el slug a partir del nombre
  onNameBlur(): void {
    if (!this.isEditing) {
      const currentSlug = this.clubForm.get('slug')?.value;
      const currentName = this.clubForm.get('name')?.value;
      if (!currentSlug && currentName) {
        const generated = currentName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        this.clubForm.patchValue({ slug: generated });
      }
    }
  }

  openNewModal(): void {
    this.isEditing = false;
    this.selectedClubId = null;
    this.clubForm.reset({
      name: '',
      slug: '',
      email: '',
      description: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      openingHour: 8,
      closingHour: 23,
      slotDurationMinutes: 60,
      paymentMode: 'PRESENTIAL',
      ownerEmail: '',
    });
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(club: SuperAdminClubResponseDto): void {
    this.isEditing = true;
    this.selectedClubId = club.id;
    this.clubForm.patchValue({
      name: club.name,
      slug: club.slug,
      email: club.email,
      description: club.description || '',
      phone: club.phone || '',
      address: club.address || '',
      city: club.city || '',
      postalCode: club.postalCode || '',
      openingHour: club.openingHour,
      closingHour: club.closingHour,
      slotDurationMinutes: club.slotDurationMinutes,
      paymentMode: club.paymentMode,
      ownerEmail: '',
    });
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  saveClub(): void {
    if (this.clubForm.invalid) {
      this.clubForm.markAllAsTouched();
      return;
    }

    const val = this.clubForm.value;
    if (val.openingHour >= val.closingHour) {
      this.notify.error('ADMIN.SETTINGS.INVALID_HOURS');
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    if (this.isEditing && this.selectedClubId) {
      const updateDto: UpdateSuperAdminClubDto = {
        name: val.name,
        slug: val.slug,
        email: val.email,
        description: val.description || undefined,
        phone: val.phone || undefined,
        address: val.address || undefined,
        city: val.city || undefined,
        postalCode: val.postalCode || undefined,
        openingHour: val.openingHour,
        closingHour: val.closingHour,
        slotDurationMinutes: val.slotDurationMinutes,
        paymentMode: val.paymentMode,
      };

      this.superAdminService
        .superAdminClubsControllerUpdate(this.selectedClubId, updateDto)
        .subscribe({
          next: () => {
            this.notify.success('SUPERADMIN.CLUBS.SUCCESS_UPDATE');
            this.displayModal = false;
            this.saving = false;
            this.cdr.markForCheck();
            this.loadClubs();
          },
          error: () => {
            this.notify.error('ERRORS.GENERIC');
            this.saving = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      const createDto: CreateClubDto = {
        name: val.name,
        slug: val.slug,
        email: val.email,
        description: val.description || undefined,
        phone: val.phone || undefined,
        address: val.address || undefined,
        city: val.city || undefined,
        postalCode: val.postalCode || undefined,
        openingHour: val.openingHour,
        closingHour: val.closingHour,
        slotDurationMinutes: val.slotDurationMinutes,
        paymentMode: val.paymentMode as CreateClubDtoPaymentMode,
        ownerEmail: val.ownerEmail || undefined,
      };

      this.superAdminService.superAdminClubsControllerCreate(createDto).subscribe({
        next: () => {
          this.notify.success('SUPERADMIN.CLUBS.SUCCESS_CREATE');
          this.displayModal = false;
          this.saving = false;
          this.cdr.markForCheck();
          this.loadClubs();
        },
        error: () => {
          this.notify.error('ERRORS.GENERIC');
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
    }
  }

  toggleClubStatus(club: SuperAdminClubResponseDto): void {
    const isDeactivating = club.isActive;
    const headerKey = isDeactivating
      ? 'SUPERADMIN.CLUBS.CONFIRM_DEACTIVATE_TITLE'
      : 'SUPERADMIN.CLUBS.CONFIRM_ACTIVATE_TITLE';
    const msgKey = isDeactivating
      ? 'SUPERADMIN.CLUBS.CONFIRM_DEACTIVATE_MSG'
      : 'SUPERADMIN.CLUBS.CONFIRM_ACTIVATE_MSG';

    this.confirmService.confirm({
      headerKey,
      messageKey: msgKey,
      messageParams: { name: club.name },
      icon: isDeactivating ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle',
      severity: isDeactivating ? 'danger' : 'primary',
      acceptLabelKey: 'COMMON.CONFIRM',
      rejectLabelKey: 'COMMON.CANCEL',
      onAccept: () => {
        this.superAdminService
          .superAdminClubsControllerToggleStatus(club.id)
          .subscribe({
            next: () => {
              this.notify.success('SUPERADMIN.CLUBS.SUCCESS_TOGGLE');
              this.cdr.markForCheck();
              this.loadClubs();
            },
            error: () => {
              this.notify.error('ERRORS.GENERIC');
              this.cdr.markForCheck();
            },
          });
      },
    });
  }
}
