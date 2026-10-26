import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  FacilitiesService,
  FacilityBlockResponseDto,
  FacilityResponseDto,
  NotificationService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-facility-blocks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
  ],
  templateUrl: './facility-blocks.component.html',
  styleUrls: ['./facility-blocks.component.scss'],
})
export class FacilityBlocksComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly facilitiesService = inject(FacilitiesService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  facilities: FacilityResponseDto[] = [];
  facilityId = '';
  facilityName = '';
  blocks: FacilityBlockResponseDto[] = [];
  loading = false;
  saving = false;
  displayModal = false;

  blockForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    reason: [''],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.facilityId = '';
    this.facilityName = '';
    this.loading = true;
    this.facilitiesService.facilitiesControllerFindAll().subscribe({
      next: (facilities) => {
        this.facilities = facilities;
        if (routeId) {
          this.facilityId = routeId;
          const found = facilities.find((f) => f.id === routeId);
          this.facilityName = found ? found.name : '';
        } else if (facilities.length > 0) {
          this.facilityId = facilities[0].id;
          this.facilityName = facilities[0].name;
        }

        if (this.facilityId) {
          this.loadBlocks();
        } else {
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.loading = false;
        this.notify.error('ERRORS.NETWORK');
        this.cdr.markForCheck();
      },
    });
  }

  onFacilityChange(newFacilityId: string): void {
    if (!newFacilityId || newFacilityId === this.facilityId) return;
    this.facilityId = newFacilityId;
    const found = this.facilities.find((f) => f.id === newFacilityId);
    this.facilityName = found ? found.name : '';
    this.loadBlocks();
  }

  loadFacilityInfo(): void {
    if (!this.facilityId) return;
    this.facilitiesService.facilitiesControllerFindOne(this.facilityId).subscribe({
      next: (facility) => {
        this.facilityName = facility.name;
        this.cdr.markForCheck();
      },
    });
  }

  loadBlocks(): void {
    if (!this.facilityId) {
      this.blocks = [];
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
    this.loading = true;
    this.cdr.markForCheck();
    this.facilitiesService.facilitiesControllerFindBlocks(this.facilityId).subscribe({
      next: (data) => {
        this.blocks = data;
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

  openCreateModal(): void {
    this.blockForm.reset({
      title: '',
      reason: '',
      startTime: '',
      endTime: '',
    });
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  onSubmitBlock(): void {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }

    const { title, reason, startTime, endTime } = this.blockForm.value;

    if (new Date(startTime) >= new Date(endTime)) {
      this.notify.warn('ADMIN.BLOCKS.ERRORS.INVALID_DATES');
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();
    this.facilitiesService
      .facilitiesControllerCreateBlock(this.facilityId, {
        title,
        reason: reason || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.displayModal = false;
          this.notify.success('ADMIN.BLOCKS.SUCCESS_CREATE');
          this.loadBlocks();
          this.cdr.markForCheck();
        },
        error: () => {
          this.saving = false;
          this.notify.error('ERRORS.GENERIC');
          this.cdr.markForCheck();
        },
      });
  }

  onRemoveBlock(blockId: string): void {
    this.confirmService.confirmDelete({
      headerKey: 'ADMIN.BLOCKS.CONFIRM_DELETE_TITLE',
      messageKey: 'ADMIN.BLOCKS.CONFIRM_DELETE_MSG',
      onAccept: () => {
        this.facilitiesService
          .facilitiesControllerRemoveBlock(this.facilityId, blockId)
          .subscribe({
            next: () => {
              this.notify.info('ADMIN.BLOCKS.SUCCESS_DELETE');
              this.loadBlocks();
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
