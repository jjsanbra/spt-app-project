import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/v1/facilities',
    };

    mockResponse = {
      statusCode: 200,
    };

    mockContext = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ success: true })),
    };
  });

  it('debe estar definido', () => {
    expect(interceptor).toBeDefined();
  });

  it('debe interceptar y permitir el flujo de la petición exitosa', (done) => {
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({ success: true });
        done();
      },
      error: done.fail,
    });
  });

  it('debe propagar el error cuando el manejador falla', (done) => {
    const error = new Error('Fallo en controlador');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('No debería emitir éxito'),
      error: (err) => {
        expect(err).toBe(error);
        done();
      },
    });
  });

  it('debe omitir peticiones que no sean HTTP (por ejemplo WebSocket)', (done) => {
    (mockContext.getType as jest.Mock).mockReturnValue('ws');

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({ success: true });
        expect(mockContext.switchToHttp).not.toHaveBeenCalled();
        done();
      },
      error: done.fail,
    });
  });
});
