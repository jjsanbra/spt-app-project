import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  CreateFacilityDtoSportType as SportType,
  CreatePricingRuleDto,
  CreatePricingRuleDtoSportType,
  FacilitiesService,
  FacilityResponseDto,
  NotificationService,
  PricingRuleResponseDto,
  PricingRuleResponseDtoSportType,
  PricingService,
  UpdatePricingRuleDto,
  PageHeaderComponent,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export type PricingScope = 'GLOBAL' | 'SPORT' | 'FACILITY';

@Component({
  selector: 'app-pricing-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    FloatLabel,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    TooltipModule,
  ],
  templateUrl: './pricing-list.component.html',
  styleUrls: ['./pricing-list.component.scss'],
})
export class PricingListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pricingService = inject(PricingService);
  private readonly facilitiesService = inject(FacilitiesService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  pricingRules: PricingRuleResponseDto[] = [];
  facilities: FacilityResponseDto[] = [];
  loading = false;
  saving = false;
  displayModal = false;
  isEditing = false;
  selectedRuleId: string | null = null;

  scopeOptions = [
    { label: this.translate.instant('ADMIN.PRICING.SCOPE_GLOBAL'), value: 'GLOBAL' },
    { label: this.translate.instant('ADMIN.PRICING.SCOPE_SPORT'), value: 'SPORT' },
    { label: this.translate.instant('ADMIN.PRICING.SCOPE_FACILITY'), value: 'FACILITY' },
  ];

  sportOptions = Object.values(SportType).map((sport) => ({
    label: this.translate.instant(`SPORTS.${sport}`),
    value: sport,
  }));

  facilityOptions: { label: string; value: string }[] = [];

  pricingForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    scope: ['GLOBAL', [Validators.required]],
    sportType: [null],
    facilityId: [null],
    startTime: [''],
    endTime: [''],
    memberPrice: [16, [Validators.required, Validators.min(0)]],
    guestPrice: [24, [Validators.required, Validators.min(0)]],
    lightSurcharge: [0, [Validators.min(0)]],
    priority: [1, [Validators.required, Validators.min(1)]],
    isPeakHour: [false],
  });

  ngOnInit(): void {
    this.loadPricingRules();
    this.loadFacilities();
  }

  loadPricingRules(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.pricingService.pricingControllerFindAll().subscribe({
      next: (data) => {
        this.pricingRules = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.notify.error('ERRORS.NETWORK');
        this.cdr.markForCheck();
      },
    });
  }

  loadFacilities(): void {
    this.facilitiesService.facilitiesControllerFindAll().subscribe({
      next: (data) => {
        this.facilities = data;
        this.facilityOptions = data.map((f) => ({
          label: `${f.name} (${this.translate.instant('SPORTS.' + f.sportType)})`,
          value: f.id,
        }));
        this.cdr.markForCheck();
      },
      error: () => {
        // Silencioso o log
      },
    });
  }

  getDayName(day: number): string {
    return this.translate.instant(`ADMIN.PRICING.DAYS_OF_WEEK.${day}`);
  }

  getScopeBadge(rule: PricingRuleResponseDto): {
    label: string;
    severity: 'warn' | 'info' | 'secondary';
    icon: string;
  } {
    if (rule.facilityId) {
      return {
        label: rule.facilityName || this.translate.instant('ADMIN.PRICING.SCOPE_FACILITY'),
        severity: 'warn',
        icon: 'pi pi-map-pin',
      };
    }
    if (rule.sportType) {
      return {
        label: this.translate.instant(`SPORTS.${rule.sportType}`),
        severity: 'info',
        icon: 'pi pi-bolt',
      };
    }
    return {
      label: this.translate.instant('ADMIN.PRICING.SCOPE_GLOBAL'),
      severity: 'secondary',
      icon: 'pi pi-globe',
    };
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedRuleId = null;
    this.pricingForm.reset({
      name: '',
      scope: 'GLOBAL',
      sportType: null,
      facilityId: null,
      startTime: '08:00',
      endTime: '17:00',
      memberPrice: 16,
      guestPrice: 24,
      lightSurcharge: 0,
      priority: 1,
      isPeakHour: false,
    });
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(rule: PricingRuleResponseDto): void {
    this.isEditing = true;
    this.selectedRuleId = rule.id;

    let scope: PricingScope = 'GLOBAL';
    if (rule.facilityId) {
      scope = 'FACILITY';
    } else if (rule.sportType) {
      scope = 'SPORT';
    }

    this.pricingForm.patchValue({
      name: rule.name,
      scope,
      sportType: rule.sportType || null,
      facilityId: rule.facilityId || null,
      startTime: rule.startTime || '',
      endTime: rule.endTime || '',
      memberPrice: rule.memberPrice,
      guestPrice: rule.guestPrice,
      lightSurcharge: rule.lightSurcharge,
      priority: rule.priority,
      isPeakHour: rule.isPeakHour,
    });
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  onSubmitModal(): void {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();
    const formValue = this.pricingForm.value;

    const basePayload = {
      name: formValue.name,
      facilityId: formValue.scope === 'FACILITY' ? formValue.facilityId : null,
      sportType: (formValue.scope === 'SPORT' ? formValue.sportType : null) as CreatePricingRuleDtoSportType | null,
      startTime: formValue.startTime || undefined,
      endTime: formValue.endTime || undefined,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Por defecto todos los días
      memberPrice: formValue.memberPrice,
      guestPrice: formValue.guestPrice,
      lightSurcharge: formValue.lightSurcharge || 0,
      priority: formValue.priority || 1,
      isPeakHour: formValue.isPeakHour,
    };

    if (this.isEditing && this.selectedRuleId) {
      const updatePayload: UpdatePricingRuleDto = basePayload;
      this.pricingService
        .pricingControllerUpdate(this.selectedRuleId, updatePayload)
        .subscribe({
          next: () => {
            this.saving = false;
            this.displayModal = false;
            this.notify.success('ADMIN.PRICING.SUCCESS_UPDATE');
            this.loadPricingRules();
            this.cdr.markForCheck();
          },
          error: () => {
            this.saving = false;
            this.notify.error('ERRORS.GENERIC');
            this.cdr.markForCheck();
          },
        });
    } else {
      const createPayload: CreatePricingRuleDto = basePayload;
      this.pricingService.pricingControllerCreate(createPayload).subscribe({
        next: () => {
          this.saving = false;
          this.displayModal = false;
          this.notify.success('ADMIN.PRICING.SUCCESS_CREATE');
          this.loadPricingRules();
          this.cdr.markForCheck();
        },
        error: () => {
          this.saving = false;
          this.notify.error('ERRORS.GENERIC');
          this.cdr.markForCheck();
        },
      });
    }
  }

  onDeleteRule(ruleId: string): void {
    this.confirmService.confirmDelete({
      headerKey: 'ADMIN.PRICING.CONFIRM_DELETE_TITLE',
      messageKey: 'ADMIN.PRICING.CONFIRM_DELETE_MSG',
      onAccept: () => {
        this.pricingService.pricingControllerRemove(ruleId).subscribe({
          next: () => {
            this.notify.info('ADMIN.PRICING.SUCCESS_DELETE');
            this.loadPricingRules();
            this.cdr.markForCheck();
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
