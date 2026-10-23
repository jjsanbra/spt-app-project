import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  NotificationService,
  PricingRuleResponseDto,
  PricingService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-pricing-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    TooltipModule,
  ],
  templateUrl: './pricing-list.component.html',
  styleUrls: ['./pricing-list.component.scss'],
})
export class PricingListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pricingService = inject(PricingService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  pricingRules: PricingRuleResponseDto[] = [];
  loading = false;
  saving = false;
  displayModal = false;
  isEditing = false;
  selectedRuleId: string | null = null;

  pricingForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
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

  getDayName(day: number): string {
    return this.translate.instant(`ADMIN.PRICING.DAYS_OF_WEEK.${day}`);
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedRuleId = null;
    this.pricingForm.reset({
      name: '',
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
    this.pricingForm.patchValue({
      name: rule.name,
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

    const payload = {
      name: formValue.name,
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
      this.pricingService
        .pricingControllerUpdate(this.selectedRuleId, payload)
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
      this.pricingService.pricingControllerCreate(payload).subscribe({
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
