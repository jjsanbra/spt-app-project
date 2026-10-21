import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UserSummaryDto } from '../api/model';

describe('AuthService (Frontend)', () => {
  let service: AuthService;
  let httpMock: any;
  let routerMock: any;

  const mockUser: UserSummaryDto = {
    id: 'u1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isSuperAdmin: true,
    memberships: [
      {
        clubId: 'club-1',
        clubName: 'Club Las Rozas',
        clubSlug: 'las-rozas',
        role: 'OWNER',
        walletBalance: 50,
      },
      {
        clubId: 'club-2',
        clubName: 'Club Pozuelo',
        clubSlug: 'pozuelo',
        role: 'MEMBER',
        walletBalance: 10,
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();

    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe crearse el servicio', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login debe almacenar tokens, establecer currentUser y activeClub', () => {
    const authResponse = {
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
      user: mockUser,
    };
    httpMock.post.mockReturnValue(of(authResponse));

    service.login({ email: 'test@example.com', password: 'pwd' }).subscribe();

    expect(localStorage.getItem('spt_access_token')).toBe('access-jwt');
    expect(localStorage.getItem('spt_refresh_token')).toBe('refresh-jwt');
    expect(service.currentUser()?.email).toBe('test@example.com');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isSuperAdmin()).toBe(true);
    expect(service.activeClub()?.clubId).toBe('club-1');
  });

  it('register debe almacenar tokens y usuario', () => {
    const authResponse = {
      accessToken: 'access-reg',
      refreshToken: 'refresh-reg',
      user: { ...mockUser, isSuperAdmin: false },
    };
    httpMock.post.mockReturnValue(of(authResponse));

    service.register({ email: 'new@example.com', password: 'pwd', firstName: 'N', lastName: 'U' }).subscribe();

    expect(localStorage.getItem('spt_access_token')).toBe('access-reg');
    expect(service.currentUser()?.email).toBe('test@example.com');
    expect(service.isSuperAdmin()).toBe(false);
  });

  it('logout debe limpiar tokens y redirigir al login', () => {
    localStorage.setItem('spt_access_token', 'token');
    localStorage.setItem('spt_active_club_id', 'club-1');
    httpMock.post.mockReturnValue(of({ message: 'OK' }));

    service.logout();

    expect(localStorage.getItem('spt_access_token')).toBeNull();
    expect(localStorage.getItem('spt_active_club_id')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.activeClub()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/users/login']);
  });

  it('refreshSession debe actualizar el accessToken en localStorage', () => {
    localStorage.setItem('spt_refresh_token', 'refresh-token-val');
    httpMock.post.mockReturnValue(of({ accessToken: 'new-access-token' }));

    service.refreshSession().subscribe();

    expect(localStorage.getItem('spt_access_token')).toBe('new-access-token');
  });

  it('setActiveClub debe actualizar el activeClub signal y localStorage', () => {
    service.setActiveClub(mockUser.memberships[1]);

    expect(service.activeClub()?.clubId).toBe('club-2');
    expect(localStorage.getItem('spt_active_club_id')).toBe('club-2');
    expect(service.getActiveClubId()).toBe('club-2');
  });

  it('restoreActiveClub debe restaurar club previamente guardado si coincide', () => {
    localStorage.setItem('spt_active_club_id', 'club-2');

    service.setCurrentUser(mockUser);

    expect(service.activeClub()?.clubId).toBe('club-2');
  });

  it('restoreActiveClub debe limpiar activeClub si el usuario no tiene membresías', () => {
    service.setCurrentUser({ ...mockUser, memberships: [] });

    expect(service.activeClub()).toBeNull();
    expect(localStorage.getItem('spt_active_club_id')).toBeNull();
  });

  it('initSession debe inicializar sesion si hay token guardado', () => {
    localStorage.setItem('spt_access_token', 'saved-jwt');
    httpMock.get.mockReturnValue(of(mockUser));

    service.initSession();

    expect(httpMock.get).toHaveBeenCalledWith('/api/v1/auth/me');
    expect(service.currentUser()?.id).toBe('u1');
  });

  it('initSession debe limpiar sesion si falla la llamada al endpoint /me', () => {
    localStorage.setItem('spt_access_token', 'invalid-jwt');
    httpMock.get.mockReturnValue(throwError(() => new Error('401 Unauthorized')));

    service.initSession();

    expect(localStorage.getItem('spt_access_token')).toBeNull();
    expect(service.currentUser()).toBeNull();
  });
});
