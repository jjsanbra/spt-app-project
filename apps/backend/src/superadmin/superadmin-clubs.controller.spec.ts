import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminClubsController } from './superadmin-clubs.controller';
import { SuperAdminClubsService } from './superadmin-clubs.service';

describe('SuperAdminClubsController', () => {
  let controller: SuperAdminClubsController;
  let superadminClubsService: {
    findAll: jest.Mock;
    createClub: jest.Mock;
    findById: jest.Mock;
    updateClub: jest.Mock;
    toggleStatus: jest.Mock;
    getOverview: jest.Mock;
  };

  const clubId = 'club-uuid-1';

  beforeEach(async () => {
    superadminClubsService = {
      findAll: jest.fn(),
      createClub: jest.fn(),
      findById: jest.fn(),
      updateClub: jest.fn(),
      toggleStatus: jest.fn(),
      getOverview: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminClubsController],
      providers: [
        {
          provide: SuperAdminClubsService,
          useValue: superadminClubsService,
        },
      ],
    }).compile();

    controller = module.get<SuperAdminClubsController>(SuperAdminClubsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll debe delegar con isActive booleano', async () => {
    superadminClubsService.findAll.mockResolvedValue({ items: [], total: 0 });

    const result = await controller.findAll('padel', 'true');
    expect(superadminClubsService.findAll).toHaveBeenCalledWith('padel', true);
    expect(result.total).toBe(0);
  });

  it('create debe delegar en superadminClubsService.createClub', async () => {
    const dto = { name: 'Club Nuevo', slug: 'club-nuevo', email: 'c@c.com' };
    superadminClubsService.createClub.mockResolvedValue({ id: clubId, name: 'Club Nuevo' });

    const result = await controller.create(dto as any);
    expect(superadminClubsService.createClub).toHaveBeenCalledWith(dto);
    expect(result.id).toBe(clubId);
  });

  it('findById debe delegar en superadminClubsService.findById', async () => {
    superadminClubsService.findById.mockResolvedValue({ id: clubId });

    const result = await controller.findById(clubId);
    expect(superadminClubsService.findById).toHaveBeenCalledWith(clubId);
    expect(result.id).toBe(clubId);
  });

  it('update debe delegar en superadminClubsService.updateClub', async () => {
    const dto = { name: 'Club Modificado' };
    superadminClubsService.updateClub.mockResolvedValue({ id: clubId, name: 'Club Modificado' });

    const result = await controller.update(clubId, dto as any);
    expect(superadminClubsService.updateClub).toHaveBeenCalledWith(clubId, dto);
    expect(result.name).toBe('Club Modificado');
  });

  it('toggleStatus debe delegar en superadminClubsService.toggleStatus', async () => {
    superadminClubsService.toggleStatus.mockResolvedValue({ id: clubId, isActive: false });

    const result = await controller.toggleStatus(clubId);
    expect(superadminClubsService.toggleStatus).toHaveBeenCalledWith(clubId);
    expect(result.isActive).toBe(false);
  });

  it('getOverview debe delegar en superadminClubsService.getOverview', async () => {
    const mockOverview = { totalClubs: 10, activeClubs: 8, totalUsers: 200, monthlyGmv: 5000, gmvGrowthPercent: 12 };
    superadminClubsService.getOverview.mockResolvedValue(mockOverview);

    const result = await controller.getOverview();
    expect(superadminClubsService.getOverview).toHaveBeenCalled();
    expect(result.totalClubs).toBe(10);
  });
});
