import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { ApplicationRef, inject, Injector } from '@angular/core';
import { catchError, finalize, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const appRef = inject(ApplicationRef);
  const injector = inject(Injector);

  const token = localStorage.getItem('spt_access_token');
  const activeClubId = localStorage.getItem('spt_active_club_id');

  let headers = req.headers;

  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (activeClubId && !headers.has('x-tenant-id')) {
    headers = headers.set('x-tenant-id', activeClubId);
  }

  let url = req.url;
  if (url.startsWith('/api')) {
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '0.0.0.0');

    const isPreEnv = typeof window !== 'undefined' && window.location.hostname.includes('-pre');

    const apiBase = isLocalhost
      ? 'http://localhost:3000'
      : isPreEnv
        ? 'https://spt-backend-pre.onrender.com'
        : 'https://spt-backend-api.onrender.com';

    url = `${apiBase}${url}`;
  }

  const clonedReq = req.clone({ url, headers });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un 401 y no es la petición de login/refresh, intentamos refrescar token
      const isAuthUrl = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
      const refreshToken = localStorage.getItem('spt_refresh_token');

      if (error.status === 401 && !isAuthUrl && refreshToken) {
        const authService = injector.get(AuthService);
        return authService.refreshSession().pipe(
          switchMap((tokenRes) => {
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${tokenRes.accessToken}`),
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          }),
        );
      }

      return throwError(() => error);
    }),

    finalize(() => {
      setTimeout(() => {
        try {
          appRef.tick();
        } catch {
          // No-op si el ciclo de detección ya está en curso o el componente fue destruido
        }
      }, 0);
    }),
  );
}
