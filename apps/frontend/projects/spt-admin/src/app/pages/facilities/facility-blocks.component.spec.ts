import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  CreateFacilityDtoSportType as SportType,
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
    sportType: SportType.PADEL,
  });

  const mockBlocks: FacilityBlockResponseDto[] = [
    getFacilitiesControllerCreateBlockResponseMock({
      id: 'block-1',
      clubId: 'club-1',
      facilityId: 'fac-1',
      facilityName: 'Pista 1 Central',
      sportType: SportType.PADEL,
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
      facilitiesControllerFindClubBlocks: vi.fn().mockReturnValue(of(mockBlocks)),
      facilitiesControllerFindBlocks: vi.fn().mockReturnValue(of(mockBlocks)),
      facilitiesControllerCreateBlock: vi.fn().mockReturnValue(of(mockBlocks[0])),
      facilitiesControllerCreateBulkBlocks: vi.fn().mockReturnValue(of(mockBlocks)),
      facilitiesControllerRemoveBlock: vi.fn().mockReturnValue(of({ success: true })),
      facilitiesControllerRemoveBlockById: vi.fn().mockReturnValue(of({ success: true })),
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

  it('debe crear el componente y cargar la información global y de la pista', () => {
    expect(component).toBeTruthy();
    expect(facilitiesServiceSpy.facilitiesControllerFindAll).toHaveBeenCalled();
    expect(facilitiesServiceSpy.facilitiesControllerFindClubBlocks).toHaveBeenCalled();
    expect(component.selectedFacilityId).toBe('fac-1');
    expect(component.prefilteredFacilityName).toBe('Pista 1 Central');
    expect(component.blocks).toHaveLength(1);
  });

  it('debe abrir el modal para programar un bloqueo con valores iniciales', () => {
    component.openCreateModal();
    expect(component.displayModal).toBeTruthy();
    expect(component.blockForm.get('title')?.value).toBe('');
    expect(component.blockForm.get('scope')?.value).toBe('SINGLE');
  });

  it('debe crear bloqueos para pista individual (scope SINGLE)', () => {
    component.openCreateModal();
    component.blockForm.patchValue({
      sportType: SportType.PADEL,
      scope: 'SINGLE',
      facilityId: 'fac-1',
      title: 'Torneo Pádel',
      reason: 'Fase eliminatoria',
      startTime: '2026-10-25T08:00',
      endTime: '2026-10-25T14:00',
    });

    component.onSubmitBlock();

    expect(facilitiesServiceSpy.facilitiesControllerCreateBulkBlocks).toHaveBeenCalledWith(
      expect.objectContaining({
        facilityIds: ['fac-1'],
        title: 'Torneo Pádel',
      }),
    );
    expect(component.displayModal).toBeFalsy();
  });

  it('debe crear bloqueos para todas las pistas del deporte (scope ALL_SPORT)', () => {
    const secondFacility = {
      ...mockFacility,
      id: 'fac-2',
      name: 'Pista 2 Cristal',
      sportType: SportType.PADEL,
    };
    component.facilities = [mockFacility, secondFacility];
    facilitiesServiceSpy.facilitiesControllerCreateBulkBlocks.mockReturnValue(
      of([mockBlocks[0], { ...mockBlocks[0], id: 'block-2', facilityId: 'fac-2' }]),
    );

    component.openCreateModal();
    component.blockForm.patchValue({
      sportType: SportType.PADEL,
      scope: 'ALL_SPORT',
      title: 'Torneo Club Fin de Semana',
      startTime: '2026-11-01T09:00',
      endTime: '2026-11-01T15:00',
    });

    component.onSubmitBlock();

    expect(facilitiesServiceSpy.facilitiesControllerCreateBulkBlocks).toHaveBeenCalledWith(
      expect.objectContaining({
        facilityIds: ['fac-1', 'fac-2'],
        title: 'Torneo Club Fin de Semana',
      }),
    );
    expect(component.displayModal).toBeFalsy();
  });

  it('no debe enviar el formulario si es inválido', () => {
    component.openCreateModal();
    component.blockForm.patchValue({ title: '' });
    component.onSubmitBlock();

    expect(facilitiesServiceSpy.facilitiesControllerCreateBulkBlocks).not.toHaveBeenCalled();
    expect(component.blockForm.touched).toBe(true);
  });

  it('debe mostrar advertencia si startTime es mayor o igual a endTime', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'warn');
    component.openCreateModal();
    component.blockForm.patchValue({
      sportType: SportType.PADEL,
      scope: 'SINGLE',
      facilityId: 'fac-1',
      title: 'Bloqueo Inválido',
      startTime: '2026-10-25T14:00',
      endTime: '2026-10-25T10:00',
    });

    component.onSubmitBlock();

    expect(notifySpy).toHaveBeenCalledWith('ADMIN.BLOCKS.ERRORS.INVALID_DATES');
    expect(facilitiesServiceSpy.facilitiesControllerCreateBulkBlocks).not.toHaveBeenCalled();
  });

  it('debe advertir si no hay pistas disponibles para el deporte al crear bloqueo', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'warn');
    component.openCreateModal();
    component.blockForm.patchValue({
      sportType: SportType.TENNIS,
      scope: 'ALL_SPORT',
      title: 'Lluvia en tenis',
      startTime: '2026-10-25T10:00',
      endTime: '2026-10-25T14:00',
    });

    component.onSubmitBlock();

    expect(notifySpy).toHaveBeenCalledWith('ADMIN.BLOCKS.NO_FACILITIES');
    expect(facilitiesServiceSpy.facilitiesControllerCreateBulkBlocks).not.toHaveBeenCalled();
  });

  it('debe manejar error al crear bloqueo en bulk', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerCreateBulkBlocks.mockReturnValue(
      throwError(() => new Error('Error al crear')),
    );

    component.openCreateModal();
    component.blockForm.patchValue({
      sportType: SportType.PADEL,
      scope: 'SINGLE',
      facilityId: 'fac-1',
      title: 'Bloqueo Fallido',
      startTime: '2026-10-25T10:00',
      endTime: '2026-10-25T12:00',
    });

    component.onSubmitBlock();

    expect(notifySpy).toHaveBeenCalledWith('ERRORS.GENERIC');
    expect(component.saving).toBe(false);
  });

  it('debe levantar o eliminar un bloqueo existente con removeBlockById', () => {
    component.onRemoveBlock(mockBlocks[0]);
    expect(facilitiesServiceSpy.facilitiesControllerRemoveBlockById).toHaveBeenCalledWith(
      'block-1',
    );

    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerRemoveBlockById.mockReturnValue(
      throwError(() => new Error('Error al borrar')),
    );
    component.onRemoveBlock(mockBlocks[0]);
    expect(notifySpy).toHaveBeenCalledWith('ERRORS.GENERIC');
  });

  it('debe filtrar bloqueos por deporte', () => {
    component.onSportFilterChange(SportType.PADEL);
    expect(component.selectedSport).toBe(SportType.PADEL);
    expect(facilitiesServiceSpy.facilitiesControllerFindClubBlocks).toHaveBeenCalled();
  });

  it('debe filtrar bloqueos por pista específica', () => {
    component.onFacilityFilterChange('fac-1');
    expect(component.selectedFacilityId).toBe('fac-1');
    expect(facilitiesServiceSpy.facilitiesControllerFindClubBlocks).toHaveBeenCalled();
  });

  it('debe inicializar sin id de ruta cuando se accede desde menú general', () => {
    const route = TestBed.inject(ActivatedRoute);
    vi.spyOn(route.snapshot.paramMap, 'get').mockReturnValue(null);

    component.ngOnInit();

    expect(component.isRoutePrefiltered).toBe(false);
    expect(component.selectedFacilityId).toBe('');
  });

  it('debe manejar error al cargar pistas en ngOnInit', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerFindAll.mockReturnValue(
      throwError(() => new Error('Error de red')),
    );

    component.ngOnInit();

    expect(notifySpy).toHaveBeenCalledWith('ERRORS.NETWORK');
    expect(component.loading).toBe(false);
  });

  it('debe manejar error al cargar bloqueos en loadBlocks', () => {
    const notifySpy = vi.spyOn(TestBed.inject(NotificationService), 'error');
    facilitiesServiceSpy.facilitiesControllerFindClubBlocks.mockReturnValue(
      throwError(() => new Error('Error al cargar bloques')),
    );

    component.loadBlocks();

    expect(notifySpy).toHaveBeenCalledWith('ERRORS.NETWORK');
    expect(component.loading).toBe(false);
  });

  it('debe devolver severidad adecuada para cada deporte en getSportSeverity', () => {
    expect(component.getSportSeverity('PADEL')).toBe('success');
    expect(component.getSportSeverity('TENNIS')).toBe('warn');
    expect(component.getSportSeverity('PICKLEBALL')).toBe('info');
    expect(component.getSportSeverity('OTHER')).toBe('secondary');
  });
});
