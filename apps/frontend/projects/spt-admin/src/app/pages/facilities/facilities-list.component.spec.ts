import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  CreateFacilityDtoCourtType as CourtType,
  CreateFacilityDtoSportType as SportType,
  CreateFacilityDtoSurfaceType as SurfaceType,
  FacilitiesService,
  FacilityResponseDto,
  NotificationService,
  getFacilitiesControllerCreateResponseMock,
} from '@core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { FacilitiesListComponent } from './facilities-list.component';

describe('FacilitiesListComponent', () => {
  let component: FacilitiesListComponent;
  let fixture: ComponentFixture<FacilitiesListComponent>;
  let facilitiesServiceSpy: any;
  let confirmDialogServiceMock: any;

  const mockFacilities: FacilityResponseDto[] = [
    getFacilitiesControllerCreateResponseMock({
      id: 'fac-1',
      clubId: 'club-1',
      name: 'Pista 1 - Cristal Pádel',
      sportType: SportType.PADEL,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.CRYSTAL,
      hasLighting: true,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
      isActive: true,
    }),
    getFacilitiesControllerCreateResponseMock({
      id: 'fac-2',
      clubId: 'club-1',
      name: 'Pista 2 - Tenis Clay',
      sportType: SportType.TENNIS,
      courtType: CourtType.OUTDOOR,
      surfaceType: SurfaceType.CLAY,
      hasLighting: true,
      defaultSlotMinutes: 60,
      minPlayers: 2,
      maxPlayers: 4,
      isActive: true,
    }),
  ];

  beforeEach(async () => {
    facilitiesServiceSpy = {
      facilitiesControllerFindAll: vi.fn().mockReturnValue(of(mockFacilities)),
      facilitiesControllerCreate: vi.fn().mockReturnValue(of(mockFacilities[0])),
      facilitiesControllerUpdate: vi.fn().mockReturnValue(of(mockFacilities[0])),
      facilitiesControllerRemove: vi.fn().mockReturnValue(of({ success: true })),
    };

    confirmDialogServiceMock = {
      confirmDelete: vi.fn().mockImplementation((opts: any) => opts.onAccept()),
      confirm: vi.fn().mockImplementation((opts: any) => opts.onAccept()),
    };

    await TestBed.configureTestingModule({
      imports: [FacilitiesListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        MessageService,
        ConfirmationService,
        NotificationService,
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
        { provide: FacilitiesService, useValue: facilitiesServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FacilitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente y cargar la lista de pistas', () => {
    expect(component).toBeTruthy();
    expect(facilitiesServiceSpy.facilitiesControllerFindAll).toHaveBeenCalled();
    expect(component.facilities).toHaveLength(2);
    expect(component.facilities[0].name).toBe('Pista 1 - Cristal Pádel');
  });

  it('debe abrir el modal de creación con valores por defecto', () => {
    component.openCreateModal();
    expect(component.displayModal).toBeTruthy();
    expect(component.isEditing).toBeFalsy();
    expect(component.facilityForm.get('sportType')?.value).toBe(SportType.PADEL);
    expect(component.facilityForm.get('defaultSlotMinutes')?.value).toBe(90);
  });

  it('debe abrir el modal de edición y precargar los datos de la pista seleccionada', () => {
    component.openEditModal(mockFacilities[1] as any);
    expect(component.displayModal).toBeTruthy();
    expect(component.isEditing).toBeTruthy();
    expect(component.selectedFacilityId).toBe('fac-2');
    expect(component.facilityForm.get('name')?.value).toBe('Pista 2 - Tenis Clay');
    expect(component.facilityForm.get('sportType')?.value).toBe(SportType.TENNIS);
  });

  it('debe llamar al endpoint de creación al enviar formulario nuevo', () => {
    component.openCreateModal();
    component.facilityForm.patchValue({
      name: 'Nueva Pista Central',
      sportType: SportType.PADEL,
      courtType: CourtType.INDOOR,
      surfaceType: SurfaceType.CRYSTAL,
      defaultSlotMinutes: 90,
      minPlayers: 4,
      maxPlayers: 4,
    });

    component.onSubmitModal();

    expect(facilitiesServiceSpy.facilitiesControllerCreate).toHaveBeenCalled();
    expect(component.displayModal).toBeFalsy();
  });

  it('debe llamar al endpoint de actualización al enviar formulario en modo edición', () => {
    component.openEditModal(mockFacilities[0] as any);
    component.facilityForm.patchValue({ name: 'Pista Editada' });

    component.onSubmitModal();

    expect(facilitiesServiceSpy.facilitiesControllerUpdate).toHaveBeenCalledWith('fac-1', expect.anything());
    expect(component.displayModal).toBeFalsy();
  });

  it('no debe enviar el formulario si es inválido', () => {
    component.openCreateModal();
    component.facilityForm.patchValue({ name: '' }); // Inválido (requerido)

    component.onSubmitModal();

    expect(facilitiesServiceSpy.facilitiesControllerCreate).not.toHaveBeenCalled();
    expect(component.facilityForm.get('name')?.touched).toBe(true);
  });

  it('debe desactivar la pista al pulsar eliminar', () => {
    component.onDeleteFacility(mockFacilities[0] as any);
    expect(facilitiesServiceSpy.facilitiesControllerRemove).toHaveBeenCalledWith('fac-1');
  });

  it('debe actualizar reactivamente defaultSlotMinutes al cambiar sportType en el formulario', () => {
    component.openCreateModal();
    const sportControl = component.facilityForm.get('sportType');
    const slotControl = component.facilityForm.get('defaultSlotMinutes');

    sportControl?.setValue(SportType.TENNIS);
    expect(slotControl?.value).toBe(60);

    sportControl?.setValue(SportType.PADEL);
    expect(slotControl?.value).toBe(90);

    sportControl?.setValue(SportType.FOOTBALL_7);
    expect(slotControl?.value).toBe(60);
  });
});

