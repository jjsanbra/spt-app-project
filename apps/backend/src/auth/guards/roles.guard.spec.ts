import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ClubRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const createMockContext = (requestData: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => requestData,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('debe permitir acceso si la ruta no requiere roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({});

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe permitir acceso si el usuario es SuperAdmin global', () => {
    reflector.getAllAndOverride.mockReturnValue([ClubRole.ADMIN]);
    const context = createMockContext({
      user: { isSuperAdmin: true },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('debe lanzar ForbiddenException si no hay contexto de tenant en la request', () => {
    reflector.getAllAndOverride.mockReturnValue([ClubRole.ADMIN]);
    const context = createMockContext({
      user: { isSuperAdmin: false },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('debe lanzar ForbiddenException si el rol del tenant no está en la lista requerida', () => {
    reflector.getAllAndOverride.mockReturnValue([ClubRole.OWNER, ClubRole.ADMIN]);
    const context = createMockContext({
      user: { isSuperAdmin: false },
      tenant: { role: ClubRole.MEMBER },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('debe permitir acceso si el rol del tenant coincide con uno requerido', () => {
    reflector.getAllAndOverride.mockReturnValue([ClubRole.OWNER, ClubRole.ADMIN]);
    const context = createMockContext({
      user: { isSuperAdmin: false },
      tenant: { role: ClubRole.ADMIN },
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
