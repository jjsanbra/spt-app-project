import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ClubRole } from '@prisma/client';
import { CurrentTenant } from './current-tenant.decorator';
import { CurrentUser } from './current-user.decorator';
import { IS_PUBLIC_KEY, Public } from './public.decorator';
import { ROLES_KEY, Roles } from './roles.decorator';

function getParamDecoratorFactory(decorator: (...args: any[]) => any) {
  class TestClass {
    public testMethod(@decorator() _value: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestClass, 'testMethod');
  return args[Object.keys(args)[0]].factory;
}

describe('Auth Decorators', () => {
  it('Public() debe establecer la metadata IS_PUBLIC_KEY en true', () => {
    class TargetClass {
      @Public()
      endpoint() {}
    }

    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, TargetClass.prototype.endpoint);
    expect(isPublic).toBe(true);
  });

  it('Roles() debe almacenar los roles requeridos en ROLES_KEY', () => {
    class TargetClass {
      @Roles(ClubRole.ADMIN, ClubRole.OWNER)
      endpoint() {}
    }

    const roles = Reflect.getMetadata(ROLES_KEY, TargetClass.prototype.endpoint);
    expect(roles).toEqual([ClubRole.ADMIN, ClubRole.OWNER]);
  });

  it('CurrentUser debe extraer el usuario completo o un campo específico', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1', email: 'user@test.com', isSuperAdmin: false },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, mockContext)).toEqual({
      id: 'u1',
      email: 'user@test.com',
      isSuperAdmin: false,
    });
    expect(factory('email', mockContext)).toBe('user@test.com');
  });

  it('CurrentTenant debe extraer el contexto de tenant completo o un campo específico', () => {
    const factory = getParamDecoratorFactory(CurrentTenant);
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          tenant: { clubId: 'club-1', role: ClubRole.ADMIN, membershipId: 'm1' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, mockContext)).toEqual({
      clubId: 'club-1',
      role: ClubRole.ADMIN,
      membershipId: 'm1',
    });
    expect(factory('clubId', mockContext)).toBe('club-1');
  });
});
