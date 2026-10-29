import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    updateProfile: jest.Mock;
    getDashboard: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      updateProfile: jest.fn(),
      getDashboard: jest.fn(),
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

  it('getDashboard debe delegar en usersService.getDashboard', async () => {
    const mockDashboard = {
      nextBooking: null,
      monthlyStats: { matchesPlayed: 5, hoursPlayed: 7.5, totalSpent: 100, estimatedLevel: '3.5 Intermedio' },
      activityHistory: [],
    };
    usersService.getDashboard.mockResolvedValue(mockDashboard);

    const result = await controller.getDashboard('u1');
    expect(usersService.getDashboard).toHaveBeenCalledWith('u1');
    expect(result.monthlyStats.matchesPlayed).toBe(5);
  });
});
