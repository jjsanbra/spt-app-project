import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  CreateFacilityDtoCourtType as CourtType,
  CreateFacilityDtoSportType as SportType,
  CreateFacilityDtoSurfaceType as SurfaceType,
  FacilitiesService,
  FacilityResponseDto,
  NotificationService,
} from '@core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

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
  ],
  templateUrl: './facilities-list.component.html',
  styleUrls: ['./facilities-list.component.scss'],
})
export class FacilitiesListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facilitiesService = inject(FacilitiesService);
  private readonly notify = inject(NotificationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);

  facilities: FacilityResponseDto[] = [];
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
  });

  readonly sportOptions = [
    { label: 'Pádel', value: SportType.PADEL },
    { label: 'Tenis', value: SportType.TENNIS },
    { label: 'Fútbol 7', value: SportType.FOOTBALL_7 },
    { label: 'Fútbol 11', value: SportType.FOOTBALL_11 },
    { label: 'Baloncesto', value: SportType.BASKETBALL },
    { label: 'Multideporte', value: SportType.MULTI_SPORT },
  ];

  readonly courtOptions = [
    { label: 'Indoor (Cubierta)', value: CourtType.INDOOR },
    { label: 'Outdoor (Exterior)', value: CourtType.OUTDOOR },
    { label: 'Cubierta / Techada', value: CourtType.COVERED },
  ];

  readonly surfaceOptions = [
    { label: 'Cristal / Césped Pro', value: SurfaceType.CRYSTAL },
    { label: 'Césped Artificial', value: SurfaceType.SYNTHETIC_GRASS },
    { label: 'Tierra Batida (Clay)', value: SurfaceType.CLAY },
    { label: 'Hormigón / Cemento', value: SurfaceType.CONCRETE },
    { label: 'Resina', value: SurfaceType.RESIN },
    { label: 'Parquet', value: SurfaceType.PARQUET },
  ];

  readonly slotOptions = [
    { label: '30 minutos', value: 30 },
    { label: '60 minutos', value: 60 },
    { label: '90 minutos', value: 90 },
    { label: '120 minutos', value: 120 },
  ];

  ngOnInit(): void {
    this.loadFacilities();
  }

  loadFacilities(): void {
    this.loading = true;
    this.facilitiesService.facilitiesControllerFindAll().subscribe({
      next: (data) => {
        this.facilities = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('ERRORS.NETWORK');
      },
    });
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
    });
    this.displayModal = true;
  }

  openEditModal(facility: FacilityResponseDto): void {
    this.isEditing = true;
    this.selectedFacilityId = facility.id;
    this.facilityForm.patchValue({
      name: facility.name,
      sportType: facility.sportType,
      courtType: facility.courtType,
      surfaceType: facility.surfaceType,
      hasLighting: facility.hasLighting,
      defaultSlotMinutes: facility.defaultSlotMinutes,
      minPlayers: facility.minPlayers,
      maxPlayers: facility.maxPlayers,
    });
    this.displayModal = true;
  }

  onSubmitModal(): void {
    if (this.facilityForm.invalid) {
      this.facilityForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.facilityForm.value;

    if (this.isEditing && this.selectedFacilityId) {
      this.facilitiesService
        .facilitiesControllerUpdate(this.selectedFacilityId, formValue)
        .subscribe({
          next: () => {
            this.saving = false;
            this.displayModal = false;
            this.notify.success('ADMIN.FACILITIES.SUCCESS_UPDATE');
            this.loadFacilities();
          },
          error: () => {
            this.saving = false;
            this.notify.error('ERRORS.GENERIC');
          },
        });
    } else {
      this.facilitiesService.facilitiesControllerCreate(formValue).subscribe({
        next: () => {
          this.saving = false;
          this.displayModal = false;
          this.notify.success('ADMIN.FACILITIES.SUCCESS_CREATE');
          this.loadFacilities();
        },
        error: () => {
          this.saving = false;
          this.notify.error('ERRORS.GENERIC');
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
          },
          error: () => {
            this.notify.error('ERRORS.GENERIC');
          },
        });
      },
    });
  }
}
