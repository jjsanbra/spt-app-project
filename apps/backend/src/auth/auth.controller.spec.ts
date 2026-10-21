import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refresh: jest.Mock;
    getMe: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      getMe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register debe delegar en authService.register', async () => {
    const dto = { email: 'test@example.com', password: 'Password123!', firstName: 'Test', lastName: 'User' };
    authService.register.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

    const result = await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result.accessToken).toBe('at');
  });

  it('login debe delegar en authService.login', async () => {
    const dto = { email: 'test@example.com', password: 'Password123!' };
    authService.login.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

    const result = await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result.accessToken).toBe('at');
  });

  it('refresh debe delegar en authService.refresh', async () => {
    authService.refresh.mockResolvedValue({ accessToken: 'new-at', refreshToken: 'new-rt' });

    const result = await controller.refresh({ refreshToken: 'old-rt' });
    expect(authService.refresh).toHaveBeenCalledWith('old-rt');
    expect(result.accessToken).toBe('new-at');
  });

  it('logout debe retornar mensaje de sesión cerrada', async () => {
    const result = await controller.logout();
    expect(result.message).toBe('Sesión cerrada exitosamente');
  });

  it('getMe debe delegar en authService.getMe con el userId', async () => {
    authService.getMe.mockResolvedValue({ id: 'u1', email: 'test@example.com' });

    const result = await controller.getMe('u1');
    expect(authService.getMe).toHaveBeenCalledWith('u1');
    expect(result.id).toBe('u1');
  });
});
