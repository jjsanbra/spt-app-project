import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/database/prisma.service';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

describe('ClubsController', () => {
  let controller: ClubsController;
  let clubsService: {
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
  };

  const clubId = 'club-uuid-1';

  beforeEach(async () => {
    clubsService = {
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubsController],
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

    controller = module.get<ClubsController>(ClubsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getSettings debe delegar en clubsService.getSettings', async () => {
    clubsService.getSettings.mockResolvedValue({ id: clubId, name: 'Club Padel' });

    const result = await controller.getSettings(clubId);
    expect(clubsService.getSettings).toHaveBeenCalledWith(clubId);
    expect(result.id).toBe(clubId);
  });

  it('updateSettings debe delegar en clubsService.updateSettings', async () => {
    const updateDto = { openingHour: 9, closingHour: 22 };
    clubsService.updateSettings.mockResolvedValue({ id: clubId, openingHour: 9, closingHour: 22 });

    const result = await controller.updateSettings(clubId, updateDto);
    expect(clubsService.updateSettings).toHaveBeenCalledWith(clubId, updateDto);
    expect(result.openingHour).toBe(9);
  });
});
