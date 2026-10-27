import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  AuthResponseDto,
  ClubMembershipSummaryDto,
  LoginDto,
  RegisterDto,
  TokenResponseDto,
  UserSummaryDto,
} from '../api/model';

const ACCESS_TOKEN_KEY = 'spt_access_token';
const REFRESH_TOKEN_KEY = 'spt_refresh_token';
const ACTIVE_CLUB_KEY = 'spt_active_club_id';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // ─── Signals de Estado Reactivo ───────────────────────────
  readonly currentUser = signal<UserSummaryDto | null>(null);
  readonly activeClub = signal<ClubMembershipSummaryDto | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isSuperAdmin = computed(() => !!this.currentUser()?.isSuperAdmin);
  readonly isOwner = computed(() => this.activeClub()?.role === 'OWNER');
  readonly isOwnerOrSuperAdmin = computed(() => this.isSuperAdmin() || this.isOwner());
  readonly userMemberships = computed(() => this.currentUser()?.memberships || []);

  constructor() {
    queueMicrotask(() => {
      this.initSession();
    });
  }

  // ─── Inicialización de Sesión ─────────────────────────────
  initSession(): void {
    const token = this.getAccessToken();
    if (!token) return;

    this.fetchCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.restoreActiveClub(user);
      },
      error: () => {
        this.clearSession();
      },
    });
  }



  // ─── Autenticación ────────────────────────────────────────
  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>('/api/v1/auth/login', dto).pipe(
      tap((res) => {
        this.saveTokens(res.accessToken, res.refreshToken);
        this.currentUser.set(res.user);
        this.restoreActiveClub(res.user);
      }),
    );
  }

  register(dto: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>('/api/v1/auth/register', dto).pipe(
      tap((res) => {
        this.saveTokens(res.accessToken, res.refreshToken);
        this.currentUser.set(res.user);
        this.restoreActiveClub(res.user);
      }),
    );
  }

  logout(): void {
    this.http.post('/api/v1/auth/logout', {}).subscribe({
      next: () => this.clearSessionAndRedirect(),
      error: () => this.clearSessionAndRedirect(),
    });
  }

  refreshSession(): Observable<TokenResponseDto> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<TokenResponseDto>('/api/v1/auth/refresh', { refreshToken })
      .pipe(
        tap((res) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
        }),
      );
  }

  fetchCurrentUser(): Observable<UserSummaryDto> {
    return this.http.get<UserSummaryDto>('/api/v1/auth/me');
  }

  setCurrentUser(user: UserSummaryDto): void {
    this.currentUser.set(user);
    this.restoreActiveClub(user);
  }

  // ─── Gestión de Club Activo (Multi-Tenancy) ────────────────
  setActiveClub(club: ClubMembershipSummaryDto): void {
    this.activeClub.set(club);
    localStorage.setItem(ACTIVE_CLUB_KEY, club.clubId);
  }

  private restoreActiveClub(user: UserSummaryDto): void {
    if (!user.memberships || user.memberships.length === 0) {
      this.activeClub.set(null);
      localStorage.removeItem(ACTIVE_CLUB_KEY);
      return;
    }

    const savedClubId = localStorage.getItem(ACTIVE_CLUB_KEY);
    const matchedClub = user.memberships.find((m) => m.clubId === savedClubId);

    // Si coincide con el guardado, lo restauramos; si no, seleccionamos el primero por defecto
    const active = matchedClub || user.memberships[0];
    this.activeClub.set(active);
    localStorage.setItem(ACTIVE_CLUB_KEY, active.clubId);
  }

  // ─── Tokens y Almacenamiento ──────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getActiveClubId(): string | null {
    return this.activeClub()?.clubId || localStorage.getItem(ACTIVE_CLUB_KEY);
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.activeClub.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACTIVE_CLUB_KEY);
  }

  private clearSessionAndRedirect(): void {
    this.clearSession();
    this.router.navigate(['/users/login']);
  }
}
