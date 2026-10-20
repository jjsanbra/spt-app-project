import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  FacilitiesService,
  FacilityBlockResponseDto,
  NotificationService,
  getFacilitiesControllerFindOneResponseMock,
} from '@core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
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
    {
      id: 'block-1',
      clubId: 'club-1',
      facilityId: 'fac-1',
      title: 'Mantenimiento Red',
      reason: 'Sustitución de anclaje',
      startTime: '2026-10-25T10:00:00.000Z',
      endTime: '2026-10-25T14:00:00.000Z',
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    facilitiesServiceSpy = {
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
    expect(facilitiesServiceSpy.facilitiesControllerFindOne).toHaveBeenCalledWith('fac-1');
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

  it('debe levantar o eliminar un bloqueo existente', () => {
    component.onRemoveBlock('block-1');
    expect(facilitiesServiceSpy.facilitiesControllerRemoveBlock).toHaveBeenCalledWith(
      'fac-1',
      'block-1',
    );
  });
});
