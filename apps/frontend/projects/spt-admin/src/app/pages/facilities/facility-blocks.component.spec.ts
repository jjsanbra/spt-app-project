import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  FacilitiesService,
  FacilityBlockResponseDto,
  NotificationService,
  getFacilitiesControllerCreateBlockResponseMock,
  getFacilitiesControllerFindOneResponseMock,
} from '@core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { FacilityBlocksComponent } from './facility-blocks.component';

describe('FacilityBlocksComponent', () => {
  let component: FacilityBlocksComponent;
  let fixture: ComponentFixture<FacilityBlocksComponent>;
  let facilitiesServiceSpy: any;
  let confirmDialogServiceMock: any;

  const mockFacility = getFacilitiesControllerFindOneResponseMock({
    id: 'fac-1',
    name: 'Pista 1 Central',
  });

  const mockBlocks: FacilityBlockResponseDto[] = [
    getFacilitiesControllerCreateBlockResponseMock({
      id: 'block-1',
      clubId: 'club-1',
      facilityId: 'fac-1',
      title: 'Mantenimiento Red',
      reason: 'Sustitución de anclaje',
      startTime: '2026-10-25T10:00:00.000Z',
      endTime: '2026-10-25T14:00:00.000Z',
    }),
  ];

  beforeEach(async () => {
    facilitiesServiceSpy = {
      facilitiesControllerFindAll: vi.fn().mockReturnValue(of([mockFacility])),
      facilitiesControllerFindOne: vi.fn().mockReturnValue(of(mockFacility)),
      facilitiesControllerFindBlocks: vi.fn().mockReturnValue(of(mockBlocks)),
      facilitiesControllerCreateBlock: vi.fn().mockReturnValue(of(mockBlocks[0])),
      facilitiesControllerRemoveBlock: vi.fn().mockReturnValue(of({ success: true })),
    };

    confirmDialogServiceMock = {
      confirmDelete: vi.fn().mockImplementation((opts: any) => opts.onAccept()),
      confirm: vi.fn().mockImplementation((opts: any) => opts.onAccept()),
    };

    await TestBed.configureTestingModule({
      imports: [FacilityBlocksComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        MessageService,
        ConfirmationService,
        NotificationService,
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
        { provide: FacilitiesService, useValue: facilitiesServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'fac-1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FacilityBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar la información de la pista y bloqueos', () => {
    expect(component).toBeTruthy();
    expect(facilitiesServiceSpy.facilitiesControllerFindAll).toHaveBeenCalled();
    expect(facilitiesServiceSpy.facilitiesControllerFindBlocks).toHaveBeenCalledWith('fac-1');
    expect(component.facilityName).toBe('Pista 1 Central');
    expect(component.blocks).toHaveLength(1);
  });

  it('debe abrir el modal para programar un bloqueo', () => {
    component.openCreateModal();
    expect(component.displayModal).toBeTruthy();
    expect(component.blockForm.get('title')?.value).toBe('');
  });

  it('debe llamar al endpoint de creación de bloqueo al enviar el formulario', () => {
    component.openCreateModal();
    component.blockForm.patchValue({
      title: 'Torneo Pádel',
      reason: 'Fase eliminatoria',
      startTime: '2026-10-25T08:00',
      endTime: '2026-10-25T14:00',
    });

    component.onSubmitBlock();

    expect(facilitiesServiceSpy.facilitiesControllerCreateBlock).toHaveBeenCalledWith(
      'fac-1',
      expect.objectContaining({
        title: 'Torneo Pádel',
      }),
    );
    expect(component.displayModal).toBeFalsy();
  });

  it('no debe enviar el formulario si es inválido', () => {
    component.openCreateModal();
    component.blockForm.patchValue({ title: '' });
    component.onSubmitBlock();

    expect(facilitiesServiceSpy.facilitiesControllerCreateBlock).not.toHaveBeenCalled();
    expect(component.blockForm.touched).toBe(true);
  });

  it('debe mostrar advertencia si startTime es mayor o igual a endTime', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'warn');
    component.openCreateModal();
    component.blockForm.patchValue({
      title: 'Bloqueo Inválido',
      startTime: '2026-10-25T14:00',
      endTime: '2026-10-25T10:00',
    });

    component.onSubmitBlock();

    expect(notifySpy).toHaveBeenCalledWith('ADMIN.BLOCKS.ERRORS.INVALID_DATES');
    expect(facilitiesServiceSpy.facilitiesControllerCreateBlock).not.toHaveBeenCalled();
  });

  it('debe manejar error al crear bloqueo', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerCreateBlock.mockReturnValue(
      throwError(() => new Error('Error al crear')),
    );

    component.openCreateModal();
    component.blockForm.patchValue({
      title: 'Bloqueo Fallido',
      startTime: '2026-10-25T10:00',
      endTime: '2026-10-25T12:00',
    });

    component.onSubmitBlock();

    expect(notifySpy).toHaveBeenCalledWith('ERRORS.GENERIC');
    expect(component.saving).toBe(false);
  });

  it('debe levantar o eliminar un bloqueo existente y manejar error', () => {
    component.onRemoveBlock('block-1');
    expect(facilitiesServiceSpy.facilitiesControllerRemoveBlock).toHaveBeenCalledWith(
      'fac-1',
      'block-1',
    );

    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerRemoveBlock.mockReturnValue(
      throwError(() => new Error('Error al borrar')),
    );
    component.onRemoveBlock('block-1');
    expect(notifySpy).toHaveBeenCalledWith('ERRORS.GENERIC');
  });

  it('debe permitir cambiar de pista seleccionada y recargar los bloqueos asociados', () => {
    const secondFacility = { ...mockFacility, id: 'fac-2', name: 'Pista 2 Cristal' };
    component.facilities = [mockFacility, secondFacility];

    component.onFacilityChange('fac-2');

    expect(component.facilityId).toBe('fac-2');
    expect(component.facilityName).toBe('Pista 2 Cristal');
    expect(facilitiesServiceSpy.facilitiesControllerFindBlocks).toHaveBeenCalledWith('fac-2');

    // Early returns
    component.onFacilityChange('fac-2'); // Mismo id
    component.onFacilityChange(''); // Id vacío
  });

  it('debe cargar la primera pista por defecto cuando no hay id en la ruta', () => {
    const route = TestBed.inject(ActivatedRoute);
    vi.spyOn(route.snapshot.paramMap, 'get').mockReturnValue(null);

    component.ngOnInit();

    expect(component.facilityId).toBe('fac-1');
    expect(component.facilityName).toBe('Pista 1 Central');
  });

  it('debe gestionar lista vacía de pistas cuando no hay id en la ruta', () => {
    const route = TestBed.inject(ActivatedRoute);
    vi.spyOn(route.snapshot.paramMap, 'get').mockReturnValue(null);
    facilitiesServiceSpy.facilitiesControllerFindAll.mockReturnValue(of([]));

    component.ngOnInit();

    expect(component.facilityId).toBe('');
    expect(component.loading).toBe(false);
  });

  it('debe manejar error al cargar pistas en ngOnInit', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerFindAll.mockReturnValue(
      throwError(() => new Error('Error al cargar pistas')),
    );

    component.ngOnInit();

    expect(notifySpy).toHaveBeenCalledWith('ERRORS.NETWORK');
    expect(component.loading).toBe(false);
  });

  it('debe llamar a loadFacilityInfo y actualizar el nombre de la pista', () => {
    component.facilityId = 'fac-1';
    component.loadFacilityInfo();

    expect(facilitiesServiceSpy.facilitiesControllerFindOne).toHaveBeenCalledWith('fac-1');
    expect(component.facilityName).toBe('Pista 1 Central');

    component.facilityId = '';
    component.loadFacilityInfo(); // early return si no hay facilityId
  });

  it('debe vaciar bloques si facilityId está vacío en loadBlocks', () => {
    component.facilityId = '';
    component.loadBlocks();

    expect(component.blocks).toEqual([]);
    expect(component.loading).toBe(false);
  });

  it('debe manejar error al cargar bloques en loadBlocks', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerFindBlocks.mockReturnValue(
      throwError(() => new Error('Error al cargar bloques')),
    );

    component.facilityId = 'fac-1';
    component.loadBlocks();

    expect(notifySpy).toHaveBeenCalledWith('ERRORS.NETWORK');
    expect(component.loading).toBe(false);
  });
});
