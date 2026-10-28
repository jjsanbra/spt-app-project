import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const SKIP_LOADING_HEADER = 'X-Skip-Loading';

/**
 * loadingInterceptor — Interceptor HTTP funcional que incrementa el contador de carga
 * al iniciar una petición y lo decrementa al finalizar (éxito o error).
 * Permite saltarse la carga pasando la cabecera 'X-Skip-Loading'.
 */
export function loadingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  if (req.headers.has(SKIP_LOADING_HEADER)) {
    const headers = req.headers.delete(SKIP_LOADING_HEADER);
    return next(req.clone({ headers }));
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
}

