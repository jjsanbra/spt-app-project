import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new JwtAuthGuard(reflector as unknown as Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('debe permitir acceso directo si la ruta está marcada con @Public()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe delegar a super.canActivate si la ruta no es pública', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    // super.canActivate invocará el passport guard
    const superCanActivateSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true as any);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    superCanActivateSpy.mockRestore();
  });
});
