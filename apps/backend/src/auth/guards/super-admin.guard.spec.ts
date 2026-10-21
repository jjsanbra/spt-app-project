import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SuperAdminGuard } from './super-admin.guard';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    guard = new SuperAdminGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('debe lanzar UnauthorizedException si no hay usuario', () => {
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('debe lanzar ForbiddenException si el usuario no es SuperAdmin', () => {
    const context = createMockContext({ id: 'u1', isSuperAdmin: false });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('debe permitir el acceso si el usuario es SuperAdmin', () => {
    const context = createMockContext({ id: 'sa1', isSuperAdmin: true });
    expect(guard.canActivate(context)).toBe(true);
  });
});
