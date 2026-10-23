import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  FacilitiesService,
  FacilityResponseDto,
  NotificationService,
  PricingRuleResponseDto,
  PricingService,
  getFacilitiesControllerCreateResponseMock,
  getPricingControllerCreateResponseMock,
  CreateFacilityDtoSportType as SportType,
} from '@core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PricingListComponent } from './pricing-list.component';

describe('PricingListComponent', () => {
  let component: PricingListComponent;
  let fixture: ComponentFixture<PricingListComponent>;
  let pricingServiceSpy: any;
  let facilitiesServiceSpy: any;
  let confirmDialogServiceMock: any;

  const mockFacilities: FacilityResponseDto[] = [
    getFacilitiesControllerCreateResponseMock({
      id: 'fac-1',
      name: 'Pista 1 Central',
      sportType: SportType.PADEL,
    }),
  ];

  const mockRules: PricingRuleResponseDto[] = [
    getPricingControllerCreateResponseMock({
      id: 'rule-1',
      clubId: 'club-1',
      facilityId: null,
      facilityName: null,
      sportType: null,
      name: 'Tarifa Mañanas',
      isPeakHour: false,
      startTime: '08:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      memberPrice: 16.0,
      guestPrice: 24.0,
      lightSurcharge: 0.0,
      priority: 1,
    }),
    getPricingControllerCreateResponseMock({
      id: 'rule-2',
      clubId: 'club-1',
      facilityId: 'fac-1',
      facilityName: 'Pista 1 Central',
      sportType: null,
      name: 'Tarifa Tardes Punta Pista 1',
      isPeakHour: true,
      startTime: '17:00',
      endTime: '23:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      memberPrice: 24.0,
      guestPrice: 32.0,
      lightSurcharge: 4.0,
      priority: 2,
    }),
    getPricingControllerCreateResponseMock({
      id: 'rule-3',
      clubId: 'club-1',
      facilityId: null,
      sportType: SportType.TENNIS,
      name: 'Tarifa Tenis General',
      isPeakHour: false,
      memberPrice: 18.0,
      guestPrice: 26.0,
      priority: 1,
    }),
  ];

  beforeEach(async () => {
    pricingServiceSpy = {
      pricingControllerFindAll: vi.fn().mockReturnValue(of(mockRules)),
      pricingControllerCreate: vi.fn().mockReturnValue(of(mockRules[0])),
      pricingControllerUpdate: vi.fn().mockReturnValue(of(mockRules[0])),
      pricingControllerRemove: vi.fn().mockReturnValue(of({ success: true })),
    };

    facilitiesServiceSpy = {
      facilitiesControllerFindAll: vi.fn().mockReturnValue(of(mockFacilities)),
    };

    confirmDialogServiceMock = {
      confirmDelete: vi.fn().mockImplementation((opts: any) => opts.onAccept()),
      confirm: vi.fn().mockImplementation((opts: any) => opts.onAccept()),
    };

    await TestBed.configureTestingModule({
      imports: [PricingListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        MessageService,
        ConfirmationService,
        NotificationService,
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
        { provide: PricingService, useValue: pricingServiceSpy },
        { provide: FacilitiesService, useValue: facilitiesServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente y cargar la lista de reglas tarifarias y pistas', () => {
    expect(component).toBeTruthy();
    expect(pricingServiceSpy.pricingControllerFindAll).toHaveBeenCalled();
    expect(facilitiesServiceSpy.facilitiesControllerFindAll).toHaveBeenCalled();
    expect(component.pricingRules).toHaveLength(3);
    expect(component.pricingRules[0].name).toBe('Tarifa Mañanas');
    expect(component.facilities).toHaveLength(1);
    expect(component.facilityOptions).toHaveLength(1);
  });

  it('debe abrir el modal de creación con valores por defecto', () => {
    component.openCreateModal();
    expect(component.displayModal).toBeTruthy();
    expect(component.isEditing).toBeFalsy();
    expect(component.pricingForm.get('memberPrice')?.value).toBe(16);
    expect(component.pricingForm.get('guestPrice')?.value).toBe(24);
  });

  it('debe abrir el modal de edición y precargar los datos de la regla seleccionada con ámbito pista', () => {
    component.openEditModal(mockRules[1]);
    expect(component.displayModal).toBeTruthy();
    expect(component.isEditing).toBeTruthy();
    expect(component.selectedRuleId).toBe('rule-2');
    expect(component.pricingForm.get('name')?.value).toBe('Tarifa Tardes Punta Pista 1');
    expect(component.pricingForm.get('scope')?.value).toBe('FACILITY');
    expect(component.pricingForm.get('facilityId')?.value).toBe('fac-1');
  });

  it('debe abrir el modal de edición para una regla de deporte y configurar scope SPORT', () => {
    component.openEditModal(mockRules[2]);
    expect(component.displayModal).toBeTruthy();
    expect(component.pricingForm.get('scope')?.value).toBe('SPORT');
    expect(component.pricingForm.get('sportType')?.value).toBe(SportType.TENNIS);
  });

  it('debe devolver el badge correspondiente según el ámbito de la tarifa', () => {
    const facilityBadge = component.getScopeBadge(mockRules[1]);
    expect(facilityBadge.severity).toBe('warn');
    expect(facilityBadge.label).toBe('Pista 1 Central');

    const sportBadge = component.getScopeBadge(mockRules[2]);
    expect(sportBadge.severity).toBe('info');

    const globalBadge = component.getScopeBadge(mockRules[0]);
    expect(globalBadge.severity).toBe('secondary');
  });

  it('debe enviar la nueva regla de tarifa con ámbito pista al enviar el formulario', () => {
    component.openCreateModal();
    component.pricingForm.patchValue({
      name: 'Tarifa Especial Pista 1',
      scope: 'FACILITY',
      facilityId: 'fac-1',
      startTime: '09:00',
      endTime: '22:00',
      memberPrice: 20,
      guestPrice: 30,
      lightSurcharge: 3,
      priority: 3,
      isPeakHour: true,
    });

    component.onSubmitModal();

    expect(pricingServiceSpy.pricingControllerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tarifa Especial Pista 1',
        facilityId: 'fac-1',
      }),
    );
    expect(component.displayModal).toBeFalsy();
  });

  it('debe actualizar la regla de tarifa al enviar formulario en modo edición', () => {
    component.openEditModal(mockRules[0]);
    component.pricingForm.patchValue({ name: 'Tarifa Actualizada' });

    component.onSubmitModal();

    expect(pricingServiceSpy.pricingControllerUpdate).toHaveBeenCalledWith('rule-1', expect.anything());
    expect(component.displayModal).toBeFalsy();
  });

  it('no debe enviar el formulario si es inválido', () => {
    component.openCreateModal();
    component.pricingForm.patchValue({ name: '' });

    component.onSubmitModal();

    expect(pricingServiceSpy.pricingControllerCreate).not.toHaveBeenCalled();
    expect(component.pricingForm.get('name')?.touched).toBe(true);
  });

  it('debe eliminar la regla de precio al pulsar eliminar', () => {
    component.onDeleteRule('rule-1');
    expect(pricingServiceSpy.pricingControllerRemove).toHaveBeenCalledWith('rule-1');
  });
});

