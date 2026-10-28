import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ClubSettingsResponseDto,
  ClubSettingsResponseDtoPaymentMode as PaymentMode,
  ClubsSettingsService,
  NotificationService,
  SuperadminClubsService,
  getClubsControllerGetSettingsResponseMock,
} from '@core';
import { of, throwError } from 'rxjs';
import { ClubSettingsComponent } from './club-settings.component';

describe('ClubSettingsComponent', () => {
  let component: ClubSettingsComponent;
  let fixture: ComponentFixture<ClubSettingsComponent>;
  let mockClubsService: any;
  let mockSuperadminClubsService: any;
  let mockNotify: any;
  let mockAuthService: any;

  const mockSettings: ClubSettingsResponseDto = getClubsControllerGetSettingsResponseMock({
    id: 'club-1',
    name: 'Padel Club Madrid',
    slug: 'padel-club-madrid',
    description: 'Instalaciones deportivas de pádel' as any,
    email: 'contacto@club.com',
    phone: '+34911111111' as any,
    address: 'Calle Mayor 1' as any,
    city: 'Madrid' as any,
    postalCode: '28001' as any,
    openingHour: 8,
    closingHour: 23,
    slotDurationMinutes: 60,
    openGameMinNoticeHours: 2,
    paymentMode: PaymentMode.PRESENTIAL,
  });

  const mockActiveClub = {
    clubId: 'club-1',
    clubName: 'Padel Club Madrid',
    clubSlug: 'padel-club-madrid',
    clubCity: 'Madrid',
    role: 'OWNER',
    memberNumber: 'OWN-01',
    walletBalance: 0,
    joinedAt: '2026-01-01',
  };

  beforeEach(async () => {
    mockClubsService = {
      clubsControllerGetSettings: vi.fn().mockReturnValue(of(mockSettings)),
      clubsControllerUpdateSettings: vi.fn().mockReturnValue(of(mockSettings)),
    };

    mockSuperadminClubsService = {
      superAdminClubsControllerFindAll: vi.fn().mockReturnValue(
        of({
          items: [
            {
              id: 'club-1',
              name: 'Padel Club Madrid',
              slug: 'padel-club-madrid',
              city: 'Madrid',
            },
          ],
          total: 1,
        }),
      ),
    };

    mockNotify = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    mockAuthService = {
      currentUser: signal({
        id: 'u1',
        email: 'admin@spt.com',
        firstName: 'Admin',
        lastName: 'User',
        isSuperAdmin: false,
        memberships: [mockActiveClub],
      }),
      activeClub: signal(mockActiveClub),
      userMemberships: signal([mockActiveClub]),
      isSuperAdmin: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [ClubSettingsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService(),
        { provide: ClubsSettingsService, useValue: mockClubsService },
        { provide: SuperadminClubsService, useValue: mockSuperadminClubsService },
        { provide: NotificationService, useValue: mockNotify },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y listar los clubes gestionados por el usuario', () => {
    expect(component).toBeTruthy();
    expect(component.managedClubs.length).toBe(1);
    expect(component.managedClubs[0].name).toBe('Padel Club Madrid');
    expect(component.managedClubs[0].role).toBe('OWNER');
    expect(component.displayModal).toBe(false);
  });

  it('debe abrir el modal y cargar los ajustes del club seleccionado al pulsar configurar', () => {
    component.openConfigureModal(component.managedClubs[0]);

    expect(component.displayModal).toBe(true);
    expect(component.selectedClub).toEqual(component.managedClubs[0]);
    expect(mockClubsService.clubsControllerGetSettings).toHaveBeenCalledWith({
      headers: { 'x-tenant-id': 'club-1' },
    });
    expect(component.settingsForm.get('name')?.value).toBe('Padel Club Madrid');
    expect(component.settingsForm.get('openingHour')?.value).toBe(8);
    expect(component.settingsForm.get('closingHour')?.value).toBe(23);
  });

  it('debe enviar la actualización correctamente al guardar', () => {
    component.openConfigureModal(component.managedClubs[0]);
    component.settingsForm.patchValue({
      name: 'Padel Club Renombrado',
      openingHour: 9,
      closingHour: 22,
    });

    component.submitSettings();

    expect(mockClubsService.clubsControllerUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Padel Club Renombrado',
        openingHour: 9,
        closingHour: 22,
      }),
      { headers: { 'x-tenant-id': 'club-1' } },
    );
    expect(mockNotify.success).toHaveBeenCalledWith('ADMIN.SETTINGS.SUCCESS_UPDATE');
    expect(component.displayModal).toBe(false);
  });

  it('debe impedir guardar si la hora de apertura es mayor o igual a la de cierre', () => {
    component.openConfigureModal(component.managedClubs[0]);
    component.settingsForm.patchValue({
      openingHour: 23,
      closingHour: 8,
    });

    component.submitSettings();

    expect(mockClubsService.clubsControllerUpdateSettings).not.toHaveBeenCalled();
    expect(mockNotify.error).toHaveBeenCalled();
  });

  it('debe exponer las opciones de duración, modos de pago y horas', () => {
    expect(component.slotDurationOptions.length).toBe(4);
    expect(component.paymentModeOptions.length).toBe(3);
    expect(component.hourOptions.length).toBe(25);
    expect(component.hourOptions[0].label).toBe('00:00');
  });

  it('no debe enviar el formulario si es inválido y debe marcar campos', () => {
    component.openConfigureModal(component.managedClubs[0]);
    component.settingsForm.patchValue({ name: '', email: 'invalido' });
    component.submitSettings();

    expect(mockClubsService.clubsControllerUpdateSettings).not.toHaveBeenCalled();
    expect(component.settingsForm.touched).toBe(true);
  });

  it('debe manejar error al cargar los ajustes del club', () => {
    mockClubsService.clubsControllerGetSettings.mockReturnValue(
      throwError(() => new Error('Error al cargar')),
    );
    component.loadSettings('club-1');
    expect(mockNotify.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
    expect(component.loadingModal).toBe(false);
  });

  it('debe mostrar error específico si el servidor rechaza con 400', () => {
    mockClubsService.clubsControllerUpdateSettings.mockReturnValue(
      throwError(() => ({ status: 400, error: { message: 'Error de validación' } })),
    );

    component.openConfigureModal(component.managedClubs[0]);
    component.settingsForm.patchValue({ name: 'Nuevo Nombre' });
    component.submitSettings();

    expect(mockNotify.error).toHaveBeenCalledWith('Error de validación');
  });

  it('debe mostrar error genérico si el servidor rechaza con código distinto a 400', () => {
    mockClubsService.clubsControllerUpdateSettings.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );

    component.openConfigureModal(component.managedClubs[0]);
    component.settingsForm.patchValue({ name: 'Nuevo Nombre' });
    component.submitSettings();

    expect(mockNotify.error).toHaveBeenCalledWith('ERRORS.SERVER_ERROR');
  });

  it('debe cerrar el modal al invocar onCloseModal', () => {
    component.openConfigureModal(component.managedClubs[0]);
    expect(component.displayModal).toBe(true);

    component.onCloseModal();
    expect(component.displayModal).toBe(false);
    expect(component.selectedClub).toBeNull();
  });

  it('debe retornar severidades adecuadas según el rol del club', () => {
    expect(component.getRoleSeverity('OWNER')).toBe('danger');
    expect(component.getRoleSeverity('ADMIN')).toBe('warn');
    expect(component.getRoleSeverity('STAFF')).toBe('info');
    expect(component.getRoleSeverity('MEMBER')).toBe('success');
    expect(component.getRoleSeverity('OTHER')).toBe('secondary');
  });
});
