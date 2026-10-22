import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import {
  AuthService,
  ClubMembershipSummaryDto,
  NotificationService,
  UsersService,
  UserSummaryDto,
  getAuthControllerGetMeResponseMock,
  getUsersControllerUpdateProfileResponseMock,
} from '@core';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceMock: any;
  let usersServiceSpy: any;
  let notifySpy: any;

  const mockUser: UserSummaryDto = getAuthControllerGetMeResponseMock({
    id: 'user-profile-1',
    email: 'perfil@spt.com',
    firstName: 'Paula',
    lastName: 'Badosa',
    isSuperAdmin: false,
    memberships: [
      {
        clubId: 'club-valencia',
        clubName: 'Padel Club Valencia',
        clubSlug: 'padel-club-valencia',
        role: 'MEMBER',
        memberNumber: 'SOC-0042',
        walletBalance: 85.5,
      },
    ],
  });

  const currentUserSignal = signal<UserSummaryDto | null>(mockUser);
  const activeClubSignal = signal<ClubMembershipSummaryDto | null>(mockUser.memberships?.[0] || null);

  beforeEach(async () => {
    currentUserSignal.set(mockUser);
    activeClubSignal.set(mockUser.memberships?.[0] || null);

    authServiceMock = {
      currentUser: currentUserSignal,
      activeClub: activeClubSignal,
      userMemberships: signal(mockUser.memberships || []),
      isSuperAdmin: signal(false),
      setActiveClub: vi.fn((club: ClubMembershipSummaryDto) => activeClubSignal.set(club)),
      setCurrentUser: vi.fn((user: UserSummaryDto) => currentUserSignal.set(user)),
    };

    usersServiceSpy = {
      usersControllerUpdateProfile: vi.fn(),
    };

    notifySpy = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideTranslateService({ lang: 'es' }),
        { provide: NotificationService, useValue: notifySpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe inicializar el formulario con los datos del usuario actual desde el mock de Orval', () => {
    expect(component).toBeTruthy();
    expect(component.profileForm.get('email')?.value).toBe('perfil@spt.com');
    expect(component.profileForm.get('email')?.disabled).toBeTruthy();
    expect(component.profileForm.get('firstName')?.value).toBe('Paula');
    expect(component.profileForm.get('lastName')?.value).toBe('Badosa');
  });

  it('debe permitir cambiar de club activo', () => {
    const nuevoClub: ClubMembershipSummaryDto = {
      clubId: 'club-barcelona',
      clubName: 'Club Padel Barcelona',
      clubSlug: 'padel-barcelona',
      role: 'ADMIN',
      walletBalance: 200.0,
    };

    component.onSelectActiveClub(nuevoClub);

    expect(authServiceMock.setActiveClub).toHaveBeenCalledWith(nuevoClub);
    expect(authServiceMock.activeClub()).toEqual(nuevoClub);
    expect(notifySpy.info).toHaveBeenCalledWith(nuevoClub.clubName, 'USERS.ACTIVE_CLUB');
  });

  it('debe actualizar el perfil con éxito usando el mock de Orval', () => {
    const updatedUserMock = getUsersControllerUpdateProfileResponseMock({
      id: 'user-profile-1',
      email: 'perfil@spt.com',
      firstName: 'Paula Andrea',
      lastName: 'Badosa Gibert',
      phone: '+34699887766',
    });

    usersServiceSpy.usersControllerUpdateProfile.mockReturnValue(of(updatedUserMock));

    component.profileForm.patchValue({
      firstName: 'Paula Andrea',
      lastName: 'Badosa Gibert',
      phone: '+34699887766',
    });

    component.onSubmit();

    expect(usersServiceSpy.usersControllerUpdateProfile).toHaveBeenCalledWith({
      firstName: 'Paula Andrea',
      lastName: 'Badosa Gibert',
      phone: '+34699887766',
    });
    expect(authServiceMock.setCurrentUser).toHaveBeenCalledWith(updatedUserMock);
    expect(notifySpy.success).toHaveBeenCalledWith('USERS.UPDATE_SUCCESS', 'APP.NAME');
    expect(component.loading).toBeFalsy();
  });

  it('debe manejar error al fallar la actualización del perfil', () => {
    usersServiceSpy.usersControllerUpdateProfile.mockReturnValue(
      throwError(() => new Error('Error al actualizar')),
    );

    component.profileForm.patchValue({
      firstName: 'Paula',
      lastName: 'Badosa',
    });

    component.onSubmit();

    expect(usersServiceSpy.usersControllerUpdateProfile).toHaveBeenCalled();
    expect(notifySpy.error).toHaveBeenCalledWith('ERRORS.GENERIC', 'ERRORS.GENERIC');
    expect(component.loading).toBeFalsy();
  });
});
