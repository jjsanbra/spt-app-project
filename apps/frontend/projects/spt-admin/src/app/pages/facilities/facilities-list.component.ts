import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  CreateFacilityDto,
  CreateFacilityDtoCourtType as CourtType,
  CreateFacilityDtoSportType as SportType,
  CreateFacilityDtoSurfaceType as SurfaceType,
  CreatePricingRuleDto,
  FacilitiesService,
  FacilityResponseDto,
  NotificationService,
  PricingRuleResponseDto,
  PricingService,
  UpdateFacilityDto,
  UpdatePricingRuleDto,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export interface ResolvedBasePrice {
  memberPrice: number;
  guestPrice: number;
  source: 'FACILITY' | 'SPORT' | 'GLOBAL' | 'DEFAULT';
  sourceLabel: string;
  severity: 'warn' | 'info' | 'secondary' | 'contrast';
}

@Component({
  selector: 'app-facilities-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    TooltipModule,
  ],
  templateUrl: './facilities-list.component.html',
  styleUrls: ['./facilities-list.component.scss'],
})
export class FacilitiesListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facilitiesService = inject(FacilitiesService);
  private readonly pricingService = inject(PricingService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  facilities: FacilityResponseDto[] = [];
  pricingRules: PricingRuleResponseDto[] = [];
  loading = false;
  saving = false;
  displayModal = false;
  isEditing = false;
  selectedFacilityId: string | null = null;

  facilityForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    sportType: [SportType.PADEL, [Validators.required]],
    courtType: [CourtType.INDOOR, [Validators.required]],
    surfaceType: [SurfaceType.CRYSTAL, [Validators.required]],
    hasLighting: [true],
    defaultSlotMinutes: [90, [Validators.required]],
    minPlayers: [4, [Validators.required, Validators.min(1)]],
    maxPlayers: [4, [Validators.required, Validators.min(1)]],
    customPricing: [false],
    customMemberPrice: [16, [Validators.min(0)]],
    customGuestPrice: [24, [Validators.min(0)]],
    existingPricingRuleId: [null],
  });

  get sportOptions() {
    return [
      { label: this.translate.instant('SPORTS.PADEL'), value: SportType.PADEL },
      { label: this.translate.instant('SPORTS.TENNIS'), value: SportType.TENNIS },
      { label: this.translate.instant('SPORTS.FOOTBALL_7'), value: SportType.FOOTBALL_7 },
      { label: this.translate.instant('SPORTS.FOOTBALL_11'), value: SportType.FOOTBALL_11 },
      { label: this.translate.instant('SPORTS.FUTSAL'), value: SportType.FUTSAL },
      { label: this.translate.instant('SPORTS.BASKETBALL'), value: SportType.BASKETBALL },
      { label: this.translate.instant('SPORTS.PICKLEBALL'), value: SportType.PICKLEBALL },
      { label: this.translate.instant('SPORTS.SQUASH'), value: SportType.SQUASH },
      { label: this.translate.instant('SPORTS.BADMINTON'), value: SportType.BADMINTON },
      { label: this.translate.instant('SPORTS.VOLLEYBALL'), value: SportType.VOLLEYBALL },
      { label: this.translate.instant('SPORTS.BEACH_VOLLEY'), value: SportType.BEACH_VOLLEY },
      { label: this.translate.instant('SPORTS.FRONTON'), value: SportType.FRONTON },
      { label: this.translate.instant('SPORTS.INDOOR_FRONTON'), value: SportType.INDOOR_FRONTON },
      { label: this.translate.instant('SPORTS.HANDBALL'), value: SportType.HANDBALL },
      { label: this.translate.instant('SPORTS.TABLE_TENNIS'), value: SportType.TABLE_TENNIS },
      { label: this.translate.instant('SPORTS.ATHLETICS_TRACK'), value: SportType.ATHLETICS_TRACK },
      { label: this.translate.instant('SPORTS.SWIMMING_LANE'), value: SportType.SWIMMING_LANE },
      { label: this.translate.instant('SPORTS.CLIMBING_WALL'), value: SportType.CLIMBING_WALL },
      { label: this.translate.instant('SPORTS.MULTI_SPORT'), value: SportType.MULTI_SPORT },
    ];
  }

  get courtOptions() {
    return [
      { label: this.translate.instant('ADMIN.FACILITIES.COURT_TYPE_INDOOR'), value: CourtType.INDOOR },
      { label: this.translate.instant('ADMIN.FACILITIES.COURT_TYPE_OUTDOOR'), value: CourtType.OUTDOOR },
      { label: this.translate.instant('ADMIN.FACILITIES.COURT_TYPE_COVERED'), value: CourtType.COVERED },
    ];
  }

  get surfaceOptions() {
    return [
      { label: this.translate.instant('ADMIN.FACILITIES.SURFACE_CRYSTAL'), value: SurfaceType.CRYSTAL },
      { label: this.translate.instant('ADMIN.FACILITIES.SURFACE_SYNTHETIC_GRASS'), value: SurfaceType.SYNTHETIC_GRASS },
      { label: this.translate.instant('ADMIN.FACILITIES.SURFACE_CLAY'), value: SurfaceType.CLAY },
      { label: this.translate.instant('ADMIN.FACILITIES.SURFACE_CONCRETE'), value: SurfaceType.CONCRETE },
      { label: this.translate.instant('ADMIN.FACILITIES.SURFACE_RESIN'), value: SurfaceType.RESIN },
      { label: this.translate.instant('ADMIN.FACILITIES.SURFACE_PARQUET'), value: SurfaceType.PARQUET },
    ];
  }

  getCourtTypeLabel(courtType: string): string {
    const key = `ADMIN.FACILITIES.COURT_TYPE_${courtType}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : courtType;
  }

  getSurfaceTypeLabel(surfaceType: string): string {
    const key = `ADMIN.FACILITIES.SURFACE_${surfaceType}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : surfaceType;
  }

  readonly slotOptions = [
    { label: '30 minutos', value: 30 },
    { label: '60 minutos', value: 60 },
    { label: '90 minutos', value: 90 },
    { label: '120 minutos', value: 120 },
  ];

  static readonly SPORT_DEFAULT_SLOT_MINUTES: Record<string, number> = {
    [SportType.PADEL]: 90,
    [SportType.TENNIS]: 60,
    [SportType.FOOTBALL_7]: 60,
    [SportType.FOOTBALL_11]: 60,
    [SportType.FUTSAL]: 60,
    [SportType.BASKETBALL]: 60,
    [SportType.PICKLEBALL]: 60,
    [SportType.SQUASH]: 60,
    [SportType.BADMINTON]: 60,
    [SportType.VOLLEYBALL]: 60,
    [SportType.BEACH_VOLLEY]: 60,
    [SportType.FRONTON]: 60,
    [SportType.INDOOR_FRONTON]: 60,
    [SportType.HANDBALL]: 60,
    [SportType.TABLE_TENNIS]: 60,
    [SportType.ATHLETICS_TRACK]: 60,
    [SportType.SWIMMING_LANE]: 60,
    [SportType.CLIMBING_WALL]: 60,
    [SportType.MULTI_SPORT]: 60,
  };

  ngOnInit(): void {
    this.facilityForm.get('sportType')?.valueChanges.subscribe((sport: SportType) => {
      if (sport && FacilitiesListComponent.SPORT_DEFAULT_SLOT_MINUTES[sport]) {
        this.facilityForm.patchValue(
          { defaultSlotMinutes: FacilitiesListComponent.SPORT_DEFAULT_SLOT_MINUTES[sport] },
          { emitEvent: false },
        );
      }
    });
    this.loadFacilities();
    this.loadPricingRules();
  }

  loadFacilities(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.facilitiesService.facilitiesControllerFindAll().subscribe({
      next: (data) => {
        this.facilities = data;
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

  loadPricingRules(): void {
    this.pricingService.pricingControllerFindAll().subscribe({
      next: (rules) => {
        this.pricingRules = rules;
        this.cdr.markForCheck();
      },
      error: () => {
        // Silencioso
      },
    });
  }

  resolveBasePrice(facility: FacilityResponseDto): ResolvedBasePrice {
    // 1. Regla específica de la pista
    const facilityRule = this.pricingRules.find((r) => r.facilityId === facility.id);
    if (facilityRule) {
      return {
        memberPrice: facilityRule.memberPrice,
        guestPrice: facilityRule.guestPrice,
        source: 'FACILITY',
        sourceLabel: this.translate.instant('ADMIN.PRICING.SOURCE_FACILITY'),
        severity: 'warn',
      };
    }

    // 2. Regla específica del deporte
    const sportRule = this.pricingRules.find(
      (r) => !r.facilityId && r.sportType === facility.sportType,
    );
    if (sportRule) {
      return {
        memberPrice: sportRule.memberPrice,
        guestPrice: sportRule.guestPrice,
        source: 'SPORT',
        sourceLabel: this.translate.instant('ADMIN.PRICING.SOURCE_SPORT'),
        severity: 'info',
      };
    }

    // 3. Regla global del club
    const globalRule = this.pricingRules.find((r) => !r.facilityId && !r.sportType);
    if (globalRule) {
      return {
        memberPrice: globalRule.memberPrice,
        guestPrice: globalRule.guestPrice,
        source: 'GLOBAL',
        sourceLabel: this.translate.instant('ADMIN.PRICING.SOURCE_GLOBAL'),
        severity: 'secondary',
      };
    }

    // 4. Fallback por defecto si no hay tarifas creadas en el club
    return {
      memberPrice: 16.0,
      guestPrice: 22.0,
      source: 'DEFAULT',
      sourceLabel: this.translate.instant('ADMIN.PRICING.SOURCE_DEFAULT'),
      severity: 'contrast',
    };
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedFacilityId = null;
    this.facilityForm.reset({
      name: '',
      sportType: SportType.PADEL,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.CRYSTAL,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
      customPricing: false,
      customMemberPrice: 16,
      customGuestPrice: 24,
      existingPricingRuleId: null,
    });
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(facility: FacilityResponseDto): void {
    this.isEditing = true;
    this.selectedFacilityId = facility.id;

    const existingRule = this.pricingRules.find((r) => r.facilityId === facility.id);
    const resolved = this.resolveBasePrice(facility);

    this.facilityForm.patchValue({
      name: facility.name,
      sportType: facility.sportType,
      courtType: facility.courtType,
      surfaceType: facility.surfaceType,
      hasLighting: facility.hasLighting,
      defaultSlotMinutes: facility.defaultSlotMinutes,
      minPlayers: facility.minPlayers,
      maxPlayers: facility.maxPlayers,
      customPricing: !!existingRule,
      customMemberPrice: existingRule ? existingRule.memberPrice : resolved.memberPrice,
      customGuestPrice: existingRule ? existingRule.guestPrice : resolved.guestPrice,
      existingPricingRuleId: existingRule ? existingRule.id : null,
    });
    this.displayModal = true;
    this.cdr.markForCheck();
  }

  onSubmitModal(): void {
    if (this.facilityForm.invalid) {
      this.facilityForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();
    const formValue = this.facilityForm.value;

    const facilityPayload: CreateFacilityDto = {
      name: formValue.name,
      sportType: formValue.sportType,
      courtType: formValue.courtType,
      surfaceType: formValue.surfaceType,
      hasLighting: formValue.hasLighting,
      defaultSlotMinutes: formValue.defaultSlotMinutes,
      minPlayers: formValue.minPlayers,
      maxPlayers: formValue.maxPlayers,
    };

    const handlePricingSync = (facilityId: string) => {
      if (formValue.customPricing) {
        if (formValue.existingPricingRuleId) {
          const updatePricingDto: UpdatePricingRuleDto = {
            name: `Tarifa ${formValue.name}`,
            memberPrice: formValue.customMemberPrice,
            guestPrice: formValue.customGuestPrice,
          };
          this.pricingService
            .pricingControllerUpdate(formValue.existingPricingRuleId, updatePricingDto)
            .subscribe({
              next: () => this.loadPricingRules(),
            });
        } else {
          const createPricingDto: CreatePricingRuleDto = {
            name: `Tarifa ${formValue.name}`,
            facilityId,
            sportType: formValue.sportType,
            memberPrice: formValue.customMemberPrice,
            guestPrice: formValue.customGuestPrice,
            daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
            isPeakHour: false,
            priority: 1,
          };
          this.pricingService
            .pricingControllerCreate(createPricingDto)
            .subscribe({
              next: () => this.loadPricingRules(),
            });
        }
      } else if (formValue.existingPricingRuleId) {
        this.pricingService
          .pricingControllerRemove(formValue.existingPricingRuleId)
          .subscribe({
            next: () => this.loadPricingRules(),
          });
      }
    };

    if (this.isEditing && this.selectedFacilityId) {
      const updateFacilityPayload: UpdateFacilityDto = facilityPayload;
      this.facilitiesService
        .facilitiesControllerUpdate(this.selectedFacilityId, updateFacilityPayload)
        .subscribe({
          next: () => {
            handlePricingSync(this.selectedFacilityId!);
            this.saving = false;
            this.displayModal = false;
            this.notify.success('ADMIN.FACILITIES.SUCCESS_UPDATE');
            this.loadFacilities();
            this.cdr.markForCheck();
          },
          error: () => {
            this.saving = false;
            this.notify.error('ERRORS.GENERIC');
            this.cdr.markForCheck();
          },
        });
    } else {
      this.facilitiesService.facilitiesControllerCreate(facilityPayload).subscribe({
        next: (createdFacility) => {
          handlePricingSync(createdFacility.id);
          this.saving = false;
          this.displayModal = false;
          this.notify.success('ADMIN.FACILITIES.SUCCESS_CREATE');
          this.loadFacilities();
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

  onDeleteFacility(facility: FacilityResponseDto): void {
    this.confirmService.confirmDelete({
      headerKey: 'ADMIN.FACILITIES.CONFIRM_DELETE_TITLE',
      messageKey: 'ADMIN.FACILITIES.CONFIRM_DELETE_MSG',
      onAccept: () => {
        this.facilitiesService.facilitiesControllerRemove(facility.id).subscribe({
          next: () => {
            this.notify.info('ADMIN.FACILITIES.SUCCESS_DELETE');
            this.loadFacilities();
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
