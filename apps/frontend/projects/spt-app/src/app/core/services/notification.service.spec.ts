import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageServiceSpy: any;
  let translateServiceSpy: any;

  beforeEach(() => {
    messageServiceSpy = {
      add: vi.fn(),
      clear: vi.fn(),
    };

    translateServiceSpy = {
      instant: vi.fn().mockImplementation((key: string) => `translated:${key}`),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe emitir notificación de éxito con severidad success', () => {
    service.success('FACILITY.CREATED');

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('COMMON.SUCCESS');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('FACILITY.CREATED', undefined);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'translated:COMMON.SUCCESS',
      detail: 'translated:FACILITY.CREATED',
      life: 4000,
    });
  });

  it('debe emitir notificación de error con severidad error', () => {
    service.error('FACILITY.ERROR', 'CUSTOM.ERROR_TITLE', undefined, 8000);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'translated:CUSTOM.ERROR_TITLE',
      detail: 'translated:FACILITY.ERROR',
      life: 8000,
    });
  });

  it('debe emitir notificación de advertencia y de información', () => {
    service.warn('WARN.MESSAGE');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' }),
    );

    service.info('INFO.MESSAGE');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'info' }),
    );
  });

  it('debe limpiar las notificaciones activas al invocar clear()', () => {
    service.clear();
    expect(messageServiceSpy.clear).toHaveBeenCalled();
  });
});
