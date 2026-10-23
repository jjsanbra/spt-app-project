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
  PricingRuleResponseDto,
  PricingService,
  getFacilitiesControllerCreateResponseMock,
  getPricingControllerCreateResponseMock,
} from '@core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { FacilitiesListComponent } from './facilities-list.component';

describe('FacilitiesListComponent', () => {
  let component: FacilitiesListComponent;
  let fixture: ComponentFixture<FacilitiesListComponent>;
  let facilitiesServiceSpy: any;
  let pricingServiceSpy: any;
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

  const mockPricingRules: PricingRuleResponseDto[] = [
    getPricingControllerCreateResponseMock({
      id: 'rule-fac-1',
      clubId: 'club-1',
      facilityId: 'fac-1',
      facilityName: 'Pista 1 - Cristal Pádel',
      sportType: null,
      name: 'Tarifa Pista 1',
      memberPrice: 30.0,
      guestPrice: 42.0,
      priority: 1,
    }),
    getPricingControllerCreateResponseMock({
      id: 'rule-sport-tennis',
      clubId: 'club-1',
      facilityId: null,
      sportType: SportType.TENNIS,
      name: 'Tarifa Tenis Club',
      memberPrice: 20.0,
      guestPrice: 28.0,
      priority: 1,
    }),
    getPricingControllerCreateResponseMock({
      id: 'rule-global',
      clubId: 'club-1',
      facilityId: null,
      sportType: null,
      name: 'Tarifa Global Club',
      memberPrice: 16.0,
      guestPrice: 24.0,
      priority: 1,
    }),
  ];

  beforeEach(async () => {
    facilitiesServiceSpy = {
      facilitiesControllerFindAll: vi.fn().mockReturnValue(of(mockFacilities)),
      facilitiesControllerCreate: vi.fn().mockReturnValue(of(mockFacilities[0])),
      facilitiesControllerUpdate: vi.fn().mockReturnValue(of(mockFacilities[0])),
      facilitiesControllerRemove: vi.fn().mockReturnValue(of({ success: true })),
    };

    pricingServiceSpy = {
      pricingControllerFindAll: vi.fn().mockReturnValue(of(mockPricingRules)),
      pricingControllerCreate: vi.fn().mockReturnValue(of(mockPricingRules[0])),
      pricingControllerUpdate: vi.fn().mockReturnValue(of(mockPricingRules[0])),
      pricingControllerRemove: vi.fn().mockReturnValue(of({ success: true })),
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
        { provide: PricingService, useValue: pricingServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FacilitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente y cargar la lista de pistas y tarifas', () => {
    expect(component).toBeTruthy();
    expect(facilitiesServiceSpy.facilitiesControllerFindAll).toHaveBeenCalled();
    expect(pricingServiceSpy.pricingControllerFindAll).toHaveBeenCalled();
    expect(component.facilities).toHaveLength(2);
    expect(component.facilities[0].name).toBe('Pista 1 - Cristal Pádel');
    expect(component.pricingRules).toHaveLength(3);
  });

  it('debe abrir el modal de creación con valores por defecto', () => {
    component.openCreateModal();
    expect(component.displayModal).toBeTruthy();
    expect(component.isEditing).toBeFalsy();
    expect(component.facilityForm.get('sportType')?.value).toBe(SportType.PADEL);
    expect(component.facilityForm.get('defaultSlotMinutes')?.value).toBe(90);
  });

  it('debe abrir el modal de edición y precargar los datos de la pista seleccionada', () => {
    component.openEditModal(mockFacilities[1]);
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
    component.openEditModal(mockFacilities[0]);
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
    component.onDeleteFacility(mockFacilities[0]);
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

  describe('resolveBasePrice', () => {
    it('debe resolver tarifa específica de pista cuando existe regla con facilityId', () => {
      const priceInfo = component.resolveBasePrice(mockFacilities[0]);
      expect(priceInfo.source).toBe('FACILITY');
      expect(priceInfo.severity).toBe('warn');
      expect(priceInfo.memberPrice).toBe(30.0);
      expect(priceInfo.guestPrice).toBe(42.0);
    });

    it('debe resolver tarifa de deporte cuando no hay tarifa de pista pero sí del deporte', () => {
      const priceInfo = component.resolveBasePrice(mockFacilities[1]);
      expect(priceInfo.source).toBe('SPORT');
      expect(priceInfo.severity).toBe('info');
      expect(priceInfo.memberPrice).toBe(20.0);
      expect(priceInfo.guestPrice).toBe(28.0);
    });

    it('debe resolver tarifa global cuando no hay tarifa de pista ni de deporte', () => {
      const basketFacility = getFacilitiesControllerCreateResponseMock({
        id: 'fac-3',
        sportType: SportType.BASKETBALL,
      });
      const priceInfo = component.resolveBasePrice(basketFacility);
      expect(priceInfo.source).toBe('GLOBAL');
      expect(priceInfo.severity).toBe('secondary');
      expect(priceInfo.memberPrice).toBe(16.0);
      expect(priceInfo.guestPrice).toBe(24.0);
    });

    it('debe recurrir a tarifa DEFAULT cuando no hay ninguna regla en el club', () => {
      component.pricingRules = [];
      const priceInfo = component.resolveBasePrice(mockFacilities[0]);
      expect(priceInfo.source).toBe('DEFAULT');
      expect(priceInfo.memberPrice).toBe(16.0);
      expect(priceInfo.guestPrice).toBe(22.0);
    });
  });

  describe('gestión de tarifa personalizada en formulario de pista', () => {
    it('debe precargar tarifa personalizada al abrir modal de edición de una pista con regla propia', () => {
      component.openEditModal(mockFacilities[0]);
      expect(component.facilityForm.get('customPricing')?.value).toBe(true);
      expect(component.facilityForm.get('customMemberPrice')?.value).toBe(30.0);
      expect(component.facilityForm.get('customGuestPrice')?.value).toBe(42.0);
      expect(component.facilityForm.get('existingPricingRuleId')?.value).toBe('rule-fac-1');
    });

    it('debe crear regla de tarifa al crear pista con customPricing activo', () => {
      component.openCreateModal();
      component.facilityForm.patchValue({
        name: 'Pista Pickleball 1',
        sportType: SportType.PICKLEBALL,
        customPricing: true,
        customMemberPrice: 12.0,
        customGuestPrice: 18.0,
      });

      component.onSubmitModal();

      expect(facilitiesServiceSpy.facilitiesControllerCreate).toHaveBeenCalled();
      expect(pricingServiceSpy.pricingControllerCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          facilityId: 'fac-1',
          memberPrice: 12.0,
          guestPrice: 18.0,
        }),
      );
    });

    it('debe eliminar la regla de precio de pista si se desmarca customPricing al editar', () => {
      component.openEditModal(mockFacilities[0]);
      component.facilityForm.patchValue({
        customPricing: false,
      });

      component.onSubmitModal();

      expect(pricingServiceSpy.pricingControllerRemove).toHaveBeenCalledWith('rule-fac-1');
    });
  });
});

