import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'GET',
      url: '/api/v1/test',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('debe estar definido', () => {
    expect(filter).toBeDefined();
  });

  it('debe formatear adecuadamente un HttpException estándar', () => {
    const exception = new HttpException('Recurso no encontrado', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Recurso no encontrado',
        error: 'HttpException',
        path: '/api/v1/test',
      }),
    );
  });

  it('debe formatear adecuadamente un HttpException con objeto complejo de validación', () => {
    const validationError = {
      message: ['El email no es válido', 'La contraseña es requerida'],
      error: 'Bad Request',
      statusCode: 400,
    };
    const exception = new HttpException(validationError, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['El email no es válido', 'La contraseña es requerida'],
        error: 'Bad Request',
        path: '/api/v1/test',
      }),
    );
  });

  it('debe manejar errores desconocidos como 500 Internal Server Error', () => {
    const unknownError = new Error('Error inesperado de base de datos');

    filter.catch(unknownError, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/api/v1/test',
      }),
    );
  });
});
