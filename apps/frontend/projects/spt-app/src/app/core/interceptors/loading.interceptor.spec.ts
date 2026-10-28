import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoadingService } from '../services/loading.service';
import { loadingInterceptor, SKIP_LOADING_HEADER } from './loading.interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe incrementar el contador de carga al iniciar y decrementarlo al responder', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/api/test').subscribe();

    expect(loadingService.isLoading()).toBe(true);
    expect(loadingService.activeCount()).toBe(1);

    const req = httpMock.expectOne('/api/test');
    req.flush({ success: true });

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.activeCount()).toBe(0);
  });

  it('debe decrementar el contador de carga incluso si la petición falla con error', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/api/error').subscribe({
      error: () => {},
    });

    expect(loadingService.isLoading()).toBe(true);

    const req = httpMock.expectOne('/api/error');
    req.flush('Error de servidor', { status: 500, statusText: 'Server Error' });

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.activeCount()).toBe(0);
  });

  it('debe omitir la activación del loading si se envía la cabecera X-Skip-Loading', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/api/silent', {
      headers: { [SKIP_LOADING_HEADER]: 'true' },
    }).subscribe();

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.activeCount()).toBe(0);

    const req = httpMock.expectOne('/api/silent');
    expect(req.request.headers.has(SKIP_LOADING_HEADER)).toBe(false);
    req.flush({ ok: true });

    expect(loadingService.isLoading()).toBe(false);
  });
});

