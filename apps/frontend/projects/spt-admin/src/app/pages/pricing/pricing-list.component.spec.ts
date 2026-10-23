import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  NotificationService,
  PricingRuleResponseDto,
  PricingService,
  getPricingControllerCreateResponseMock,
} from '@core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PricingListComponent } from './pricing-list.component';

describe('PricingListComponent', () => {
  let component: PricingListComponent;
  let fixture: ComponentFixture<PricingListComponent>;
  let pricingServiceSpy: any;
  let confirmDialogServiceMock: any;

  const mockRules: PricingRuleResponseDto[] = [
    getPricingControllerCreateResponseMock({
      id: 'rule-1',
      clubId: 'club-1',
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
      name: 'Tarifa Tardes Punta',
      isPeakHour: true,
      startTime: '17:00',
      endTime: '23:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      memberPrice: 24.0,
      guestPrice: 32.0,
      lightSurcharge: 4.0,
      priority: 2,
    }),
  ];

  beforeEach(async () => {
    pricingServiceSpy = {
      pricingControllerFindAll: vi.fn().mockReturnValue(of(mockRules)),
      pricingControllerCreate: vi.fn().mockReturnValue(of(mockRules[0])),
      pricingControllerUpdate: vi.fn().mockReturnValue(of(mockRules[0])),
      pricingControllerRemove: vi.fn().mockReturnValue(of({ success: true })),
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente y cargar la lista de reglas tarifarias', () => {
    expect(component).toBeTruthy();
    expect(pricingServiceSpy.pricingControllerFindAll).toHaveBeenCalled();
    expect(component.pricingRules).toHaveLength(2);
    expect(component.pricingRules[0].name).toBe('Tarifa Mañanas');
  });

  it('debe abrir el modal de creación con valores por defecto', () => {
    component.openCreateModal();
    expect(component.displayModal).toBeTruthy();
    expect(component.isEditing).toBeFalsy();
    expect(component.pricingForm.get('memberPrice')?.value).toBe(16);
    expect(component.pricingForm.get('guestPrice')?.value).toBe(24);
  });

  it('debe abrir el modal de edición y precargar los datos de la regla seleccionada', () => {
    component.openEditModal(mockRules[1] as any);
    expect(component.displayModal).toBeTruthy();
    expect(component.isEditing).toBeTruthy();
    expect(component.selectedRuleId).toBe('rule-2');
    expect(component.pricingForm.get('name')?.value).toBe('Tarifa Tardes Punta');
    expect(component.pricingForm.get('memberPrice')?.value).toBe(24.0);
  });

  it('debe enviar la nueva regla de tarifa al enviar el formulario', () => {
    component.openCreateModal();
    component.pricingForm.patchValue({
      name: 'Tarifa Fines de Semana',
      startTime: '09:00',
      endTime: '22:00',
      memberPrice: 20,
      guestPrice: 30,
      lightSurcharge: 3,
      priority: 3,
      isPeakHour: true,
    });

    component.onSubmitModal();

    expect(pricingServiceSpy.pricingControllerCreate).toHaveBeenCalled();
    expect(component.displayModal).toBeFalsy();
  });

  it('debe actualizar la regla de tarifa al enviar formulario en modo edición', () => {
    component.openEditModal(mockRules[0] as any);
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

