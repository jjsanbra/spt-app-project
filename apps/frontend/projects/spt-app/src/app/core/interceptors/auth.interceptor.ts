import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  const activeClubId = authService.getActiveClubId();

  let headers = req.headers;

  if (token && !headers.has('Authorization')) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (activeClubId && !headers.has('x-tenant-id')) {
    headers = headers.set('x-tenant-id', activeClubId);
  }

  const clonedReq = req.clone({ headers });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un 401 y no es la petición de login/refresh, intentamos refrescar token
      const isAuthUrl = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthUrl && authService.getRefreshToken()) {
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
  );
}
