import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('debe crearse con estado inicial isLoading en false y activeCount en 0', () => {
    expect(service).toBeTruthy();
    expect(service.isLoading()).toBe(false);
    expect(service.activeCount()).toBe(0);
  });

  it('debe activar isLoading en true al invocar show()', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
    expect(service.activeCount()).toBe(1);
  });

  it('debe gestionar peticiones concurrentes y desactivar solo cuando todas finalicen', () => {
    service.show();
    service.show();
    expect(service.activeCount()).toBe(2);
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.activeCount()).toBe(1);
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.activeCount()).toBe(0);
    expect(service.isLoading()).toBe(false);
  });

  it('no debe permitir contadores negativos al llamar hide() de más', () => {
    service.hide();
    expect(service.activeCount()).toBe(0);
    expect(service.isLoading()).toBe(false);
  });

  it('debe reiniciar el estado a cero al invocar reset()', () => {
    service.show();
    service.show();
    expect(service.activeCount()).toBe(2);

    service.reset();
    expect(service.activeCount()).toBe(0);
    expect(service.isLoading()).toBe(false);
  });
});

