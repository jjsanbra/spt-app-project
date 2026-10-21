import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ConfirmDialogService,
  NotificationService,
  SuperAdminClubResponseDto,
  SuperadminClubsService,
} from '@core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { SuperAdminClubsComponent } from './superadmin-clubs.component';

describe('SuperAdminClubsComponent', () => {
  let component: SuperAdminClubsComponent;
  let fixture: ComponentFixture<SuperAdminClubsComponent>;
  let superAdminServiceSpy: any;
  let confirmDialogServiceMock: any;

  const mockClubs: SuperAdminClubResponseDto[] = [
    {
      id: 'club-1',
      name: 'Club Las Rozas',
      slug: 'las-rozas-padel',
      description: 'Club moderno',
      email: 'info@lasrozas.local',
      phone: '+34910000002',
      address: 'Calle Deporte 10',
      city: 'Madrid',
      postalCode: '28230',
      openingHour: 8,
      closingHour: 23,
      slotDurationMinutes: 60,
      openGameMinNoticeHours: 2,
      paymentMode: 'PRESENTIAL',
      isActive: true,
      facilitiesCount: 6,
      membersCount: 45,
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    superAdminServiceSpy = {
      superAdminClubsControllerFindAll: vi.fn().mockReturnValue(of({ items: mockClubs, total: 1 })),
      superAdminClubsControllerCreate: vi.fn().mockReturnValue(of(mockClubs[0])),
      superAdminClubsControllerUpdate: vi.fn().mockReturnValue(of(mockClubs[0])),
      superAdminClubsControllerToggleStatus: vi.fn().mockReturnValue(of({ ...mockClubs[0], isActive: false })),
    };

    confirmDialogServiceMock = {
      confirm: vi.fn().mockImplementation((config) => {
        if (config.onAccept) config.onAccept();
      }),
    };

    await TestBed.configureTestingModule({
      imports: [SuperAdminClubsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
        { provide: SuperadminClubsService, useValue: superAdminServiceSpy },
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
        MessageService,
        ConfirmationService,
        NotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperAdminClubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse e inicializar la lista de clubes', () => {
    expect(component).toBeTruthy();
    expect(superAdminServiceSpy.superAdminClubsControllerFindAll).toHaveBeenCalled();
    expect(component.clubs.length).toBe(1);
    expect(component.clubs[0].name).toBe('Club Las Rozas');
  });

  it('debe autogenerar slug cuando se pierde el foco del campo nombre', () => {
    component.openNewModal();
    component.clubForm.patchValue({ name: 'Club Central Pádel Madrid', slug: '' });
    component.onNameBlur();
    expect(component.clubForm.get('slug')?.value).toBe('club-central-padel-madrid');
  });

  it('debe abrir el modal para un nuevo club con valores por defecto', () => {
    component.openNewModal();
    expect(component.displayModal).toBe(true);
    expect(component.isEditing).toBe(false);
    expect(component.selectedClubId).toBeNull();
    expect(component.clubForm.get('openingHour')?.value).toBe(8);
    expect(component.clubForm.get('closingHour')?.value).toBe(23);
  });

  it('debe abrir el modal en modo edición con los datos del club seleccionado', () => {
    component.openEditModal(mockClubs[0]);
    expect(component.displayModal).toBe(true);
    expect(component.isEditing).toBe(true);
    expect(component.selectedClubId).toBe('club-1');
    expect(component.clubForm.get('name')?.value).toBe('Club Las Rozas');
    expect(component.clubForm.get('slug')?.value).toBe('las-rozas-padel');
  });

  it('debe llamar a superAdminClubsControllerCreate al guardar un nuevo club válido', () => {
    component.openNewModal();
    component.clubForm.patchValue({
      name: 'Nuevo Club Deportivo',
      slug: 'nuevo-club',
      email: 'contacto@nuevo.com',
      openingHour: 9,
      closingHour: 22,
      slotDurationMinutes: 60,
      paymentMode: 'PRESENTIAL',
    });

    component.saveClub();

    expect(superAdminServiceSpy.superAdminClubsControllerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nuevo Club Deportivo',
        slug: 'nuevo-club',
        email: 'contacto@nuevo.com',
      }),
    );
    expect(component.displayModal).toBe(false);
  });

  it('debe llamar a superAdminClubsControllerUpdate al editar un club existente', () => {
    component.openEditModal(mockClubs[0]);
    component.clubForm.patchValue({ name: 'Club Editado' });

    component.saveClub();

    expect(superAdminServiceSpy.superAdminClubsControllerUpdate).toHaveBeenCalledWith(
      'club-1',
      expect.objectContaining({ name: 'Club Editado' }),
    );
    expect(component.displayModal).toBe(false);
  });

  it('no debe enviar el formulario si es inválido', () => {
    component.openNewModal();
    component.clubForm.patchValue({ name: '' });

    component.saveClub();

    expect(superAdminServiceSpy.superAdminClubsControllerCreate).not.toHaveBeenCalled();
    expect(component.clubForm.get('name')?.touched).toBe(true);
  });

  it('debe llamar a toggleClubStatus usando el diálogo de confirmación', () => {
    component.toggleClubStatus(mockClubs[0]);
    expect(confirmDialogServiceMock.confirm).toHaveBeenCalled();
    expect(superAdminServiceSpy.superAdminClubsControllerToggleStatus).toHaveBeenCalledWith('club-1');
  });
});

