import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  ClubSettingsResponseDto,
  ClubSettingsResponseDtoPaymentMode as PaymentMode,
  ClubsSettingsService,
  NotificationService,
} from '@core';
import { of, throwError } from 'rxjs';
import { ClubSettingsComponent } from './club-settings.component';

describe('ClubSettingsComponent', () => {
  let component: ClubSettingsComponent;
  let fixture: ComponentFixture<ClubSettingsComponent>;
  let mockClubsService: any;
  let mockNotify: any;

  const mockSettings: ClubSettingsResponseDto = {
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
    isActive: true,
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
  };

  beforeEach(async () => {
    mockClubsService = {
      clubsControllerGetSettings: vi.fn().mockReturnValue(of(mockSettings)),
      clubsControllerUpdateSettings: vi.fn().mockReturnValue(of(mockSettings)),
    };

    mockNotify = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ClubSettingsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslateService(),
        { provide: ClubsSettingsService, useValue: mockClubsService },
        { provide: NotificationService, useValue: mockNotify },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar los ajustes del club en el formulario', () => {
    expect(component).toBeTruthy();
    expect(mockClubsService.clubsControllerGetSettings).toHaveBeenCalled();
    expect(component.settingsForm.get('name')?.value).toBe('Padel Club Madrid');
    expect(component.settingsForm.get('openingHour')?.value).toBe(8);
    expect(component.settingsForm.get('closingHour')?.value).toBe(23);
  });

  it('debe enviar la actualización correctamente al guardar', () => {
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
    );
    expect(mockNotify.success).toHaveBeenCalledWith('ADMIN.SETTINGS.SUCCESS_UPDATE');
  });

  it('debe impedir guardar si la hora de apertura es mayor o igual a la de cierre', () => {
    component.settingsForm.patchValue({
      openingHour: 23,
      closingHour: 8,
    });

    component.submitSettings();

    expect(mockClubsService.clubsControllerUpdateSettings).not.toHaveBeenCalled();
    expect(mockNotify.error).toHaveBeenCalled();
  });

  it('debe mostrar error si el servidor rechaza la petición', () => {
    mockClubsService.clubsControllerUpdateSettings.mockReturnValue(
      throwError(() => ({ status: 400, error: { message: 'Error de validación' } })),
    );

    component.settingsForm.patchValue({ name: 'Nuevo Nombre' });
    component.submitSettings();

    expect(mockNotify.error).toHaveBeenCalledWith('Error de validación');
  });
});
