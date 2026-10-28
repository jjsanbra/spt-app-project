import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  BulkCreateFacilityBlockDto,
  ConfirmDialogService,
  FacilitiesControllerFindClubBlocksSportType,
  FacilitiesService,
  FacilityBlockResponseDto,
  FacilityResponseDto,
  NotificationService,
  PageHeaderComponent,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

interface SelectOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-facility-blocks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    PageHeaderComponent,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
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
  blocks: FacilityBlockResponseDto[] = [];
  loading = false;
  saving = false;
  displayModal = false;

  // Filtros globales
  selectedSport = '';
  selectedFacilityId = '';
  isRoutePrefiltered = false;
  prefilteredFacilityName = '';

  // Opciones de desplegables
  sportOptions: SelectOption[] = [];
  facilityFilterOptions: SelectOption[] = [];
  modalFacilityOptions: SelectOption[] = [];
  scopeOptions: SelectOption<'SINGLE' | 'ALL_SPORT'>[] = [];

  // Formulario de creación
  blockForm: FormGroup = this.fb.group({
    sportType: ['', [Validators.required]],
    scope: ['SINGLE', [Validators.required]],
    facilityId: [''],
    title: ['', [Validators.required, Validators.minLength(3)]],
    reason: [''],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.isRoutePrefiltered = !!routeId;
    this.selectedFacilityId = routeId || '';
    this.selectedSport = '';
    this.prefilteredFacilityName = '';
    this.loading = true;

    this.facilitiesService.facilitiesControllerFindAll().subscribe({
      next: (facilities) => {
        this.facilities = facilities;
        this.buildSportOptions();

        if (routeId) {
          const found = facilities.find((f) => f.id === routeId);
          if (found) {
            this.selectedSport = found.sportType;
            this.prefilteredFacilityName = found.name;
          }
        }

        this.updateFacilityFilterOptions();
        this.initScopeOptions();
        this.loadBlocks();
      },
      error: () => {
        this.loading = false;
        this.notify.error('ERRORS.NETWORK');
        this.cdr.markForCheck();
      },
    });

    // Reaccionar a cambios en el formulario del modal
    this.blockForm.get('sportType')?.valueChanges.subscribe((sport) => {
      this.updateModalFacilityOptions(sport);
    });

    this.blockForm.get('scope')?.valueChanges.subscribe((scope) => {
      const facilityControl = this.blockForm.get('facilityId');
      if (scope === 'SINGLE') {
        facilityControl?.setValidators([Validators.required]);
      } else {
        facilityControl?.clearValidators();
      }
      facilityControl?.updateValueAndValidity();
    });
  }

  initScopeOptions(): void {
    this.scopeOptions = [
      {
        label: this.translate.instant('ADMIN.BLOCKS.SCOPE_SINGLE'),
        value: 'SINGLE',
      },
      {
        label: this.translate.instant('ADMIN.BLOCKS.SCOPE_ALL_SPORT'),
        value: 'ALL_SPORT',
      },
    ];
  }

  buildSportOptions(): void {
    const uniqueSports = Array.from(new Set(this.facilities.map((f) => f.sportType)));
    this.sportOptions = [
      {
        label: this.translate.instant('ADMIN.BLOCKS.FILTER_ALL_SPORTS'),
        value: '',
      },
      ...uniqueSports.map((sport) => ({
        label: this.translate.instant(`SPORTS.${sport}`),
        value: sport,
      })),
    ];
  }

  updateFacilityFilterOptions(): void {
    let list = this.facilities;
    if (this.selectedSport) {
      list = list.filter((f) => f.sportType === this.selectedSport);
    }
    this.facilityFilterOptions = [
      {
        label: this.translate.instant('ADMIN.BLOCKS.FILTER_ALL_FACILITIES'),
        value: '',
      },
      ...list.map((f) => ({
        label: f.name,
        value: f.id,
      })),
    ];
  }

  onSportFilterChange(sport: string): void {
    this.selectedSport = sport;
    // Si la pista actual seleccionada no corresponde al deporte, reseteamos el filtro de pista
    if (this.selectedFacilityId) {
      const current = this.facilities.find((f) => f.id === this.selectedFacilityId);
      if (current && sport && current.sportType !== sport) {
        this.selectedFacilityId = '';
      }
    }
    this.updateFacilityFilterOptions();
    this.loadBlocks();
  }

  onFacilityFilterChange(facilityId: string): void {
    this.selectedFacilityId = facilityId;
    if (facilityId) {
      const current = this.facilities.find((f) => f.id === facilityId);
      if (current && !this.selectedSport) {
        this.selectedSport = current.sportType;
        this.updateFacilityFilterOptions();
      }
    }
    this.loadBlocks();
  }

  loadBlocks(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const sportParam = this.selectedSport
      ? (this.selectedSport as FacilitiesControllerFindClubBlocksSportType)
      : undefined;
    const facilityParam = this.selectedFacilityId || undefined;

    this.facilitiesService
      .facilitiesControllerFindClubBlocks({
        sportType: sportParam,
        facilityId: facilityParam,
      })
      .subscribe({
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

  updateModalFacilityOptions(sport: string): void {
    const list = sport ? this.facilities.filter((f) => f.sportType === sport) : this.facilities;
    this.modalFacilityOptions = list.map((f) => ({
      label: f.name,
      value: f.id,
    }));

    const currentFacilityId = this.blockForm.get('facilityId')?.value;
    if (list.length > 0 && (!currentFacilityId || !list.some((f) => f.id === currentFacilityId))) {
      this.blockForm.patchValue({ facilityId: list[0].id });
    }
  }

  openCreateModal(): void {
    const initialSport = this.selectedSport || (this.facilities.length > 0 ? this.facilities[0].sportType : '');
    const initialFacilityId = this.selectedFacilityId || (this.facilities.length > 0 ? this.facilities[0].id : '');

    this.blockForm.reset({
      sportType: initialSport,
      scope: 'SINGLE',
      facilityId: initialFacilityId,
      title: '',
      reason: '',
      startTime: '',
      endTime: '',
    });

    this.updateModalFacilityOptions(initialSport);
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  onSubmitBlock(): void {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }

    const { sportType, scope, facilityId, title, reason, startTime, endTime } = this.blockForm.value;

    if (new Date(startTime) >= new Date(endTime)) {
      this.notify.warn('ADMIN.BLOCKS.ERRORS.INVALID_DATES');
      return;
    }

    let targetFacilityIds: string[] = [];
    if (scope === 'ALL_SPORT') {
      targetFacilityIds = this.facilities
        .filter((f) => f.sportType === sportType)
        .map((f) => f.id);
    } else {
      targetFacilityIds = [facilityId];
    }

    if (targetFacilityIds.length === 0) {
      this.notify.warn('ADMIN.BLOCKS.NO_FACILITIES');
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const payload: BulkCreateFacilityBlockDto = {
      facilityIds: targetFacilityIds,
      title,
      reason: reason || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };

    this.facilitiesService.facilitiesControllerCreateBulkBlocks(payload).subscribe({
      next: (created) => {
        this.saving = false;
        this.displayModal = false;
        if (created.length > 1) {
          this.notify.success('ADMIN.BLOCKS.SUCCESS_BULK_CREATE');
        } else {
          this.notify.success('ADMIN.BLOCKS.SUCCESS_CREATE');
        }
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

  onRemoveBlock(block: FacilityBlockResponseDto): void {
    this.confirmService.confirmDelete({
      headerKey: 'ADMIN.BLOCKS.CONFIRM_DELETE_TITLE',
      messageKey: 'ADMIN.BLOCKS.CONFIRM_DELETE_MSG',
      onAccept: () => {
        this.facilitiesService
          .facilitiesControllerRemoveBlockById(block.id)
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

  getSportSeverity(sportType?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (sportType) {
      case 'PADEL':
        return 'success';
      case 'TENNIS':
        return 'warn';
      case 'PICKLEBALL':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
