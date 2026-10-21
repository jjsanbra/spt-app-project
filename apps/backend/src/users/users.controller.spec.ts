import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    updateProfile: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('updateProfile debe delegar en usersService.updateProfile', async () => {
    const dto = { firstName: 'Carlos' };
    usersService.updateProfile.mockResolvedValue({ id: 'u1', firstName: 'Carlos' });

    const result = await controller.updateProfile('u1', dto);
    expect(usersService.updateProfile).toHaveBeenCalledWith('u1', dto);
    expect(result.firstName).toBe('Carlos');
  });
});
