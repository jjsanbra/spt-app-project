import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/database/prisma.service';
import { ClubDashboardController } from './club-dashboard.controller';
import { ClubsService } from './clubs.service';

describe('ClubDashboardController', () => {
  let controller: ClubDashboardController;
  let clubsService: {
    getDashboard: jest.Mock;
    getOperationalDashboard: jest.Mock;
  };

  const clubId = 'club-uuid-1';

  beforeEach(async () => {
    clubsService = {
      getDashboard: jest.fn(),
      getOperationalDashboard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubDashboardController],
      providers: [
        {
          provide: ClubsService,
          useValue: clubsService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ClubDashboardController>(ClubDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getDashboard debe delegar en clubsService.getDashboard', async () => {
    const mockDashboard = {
      today: { totalBookings: 10, occupancyPercent: 60, availableCourtsNext3Hours: 2, pendingPaymentsCount: 1, activeBlocksCount: 0 },
      month: { totalRevenue: 5000, revenueGrowthPercent: 10, occupancyPercent: 65, averageTicketPrice: 25, newMembersCount: 5 },
      revenueBySport: [],
      occupancyTrend: [],
    };
    clubsService.getDashboard.mockResolvedValue(mockDashboard);

    const result = await controller.getDashboard(clubId);
    expect(clubsService.getDashboard).toHaveBeenCalledWith(clubId);
    expect(result.today.totalBookings).toBe(10);
  });

  it('getOperationalDashboard debe delegar en clubsService.getOperationalDashboard', async () => {
    const mockOperational = {
      today: { totalBookings: 8, occupancyPercent: 50, availableCourtsNext3Hours: 3, pendingPaymentsCount: 2, activeBlocksCount: 1 },
    };
    clubsService.getOperationalDashboard.mockResolvedValue(mockOperational);

    const result = await controller.getOperationalDashboard(clubId);
    expect(clubsService.getOperationalDashboard).toHaveBeenCalledWith(clubId);
    expect(result.today.availableCourtsNext3Hours).toBe(3);
  });
});

