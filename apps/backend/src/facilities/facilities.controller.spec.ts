import { Test, TestingModule } from '@nestjs/testing';
import { SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { FacilitiesAvailabilityService } from './facilities-availability.service';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';

describe('FacilitiesController', () => {
  let controller: FacilitiesController;
  let facilitiesService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    findBlocks: jest.Mock;
    createBlock: jest.Mock;
    removeBlock: jest.Mock;
    findClubBlocks: jest.Mock;
    createBulkBlocks: jest.Mock;
    removeBlockById: jest.Mock;
  };
  let availabilityService: {
    getAvailability: jest.Mock;
  };

  const clubId = 'club-uuid-1';
  const facilityId = 'fac-uuid-1';

  beforeEach(async () => {
    facilitiesService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findBlocks: jest.fn(),
      createBlock: jest.fn(),
      removeBlock: jest.fn(),
      findClubBlocks: jest.fn(),
      createBulkBlocks: jest.fn(),
      removeBlockById: jest.fn(),
    };
    availabilityService = {
      getAvailability: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilitiesController],
      providers: [
        {
          provide: FacilitiesService,
          useValue: facilitiesService,
        },
        {
          provide: FacilitiesAvailabilityService,
          useValue: availabilityService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FacilitiesController>(FacilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAvailability debe delegar en availabilityService.getAvailability', async () => {
    availabilityService.getAvailability.mockResolvedValue([]);

    const result = await controller.getAvailability(clubId, '2026-10-25', SportType.PADEL, 'u1');
    expect(availabilityService.getAvailability).toHaveBeenCalledWith(clubId, '2026-10-25', SportType.PADEL, 'u1');
    expect(result).toEqual([]);
  });

  it('findAll debe delegar en facilitiesService.findAll con isActive booleano', async () => {
    facilitiesService.findAll.mockResolvedValue([{ id: facilityId }]);

    const result = await controller.findAll(clubId, SportType.PADEL, 'true');
    expect(facilitiesService.findAll).toHaveBeenCalledWith(clubId, SportType.PADEL, true);
    expect(result).toHaveLength(1);
  });

  it('findOne debe delegar en facilitiesService.findOne', async () => {
    facilitiesService.findOne.mockResolvedValue({ id: facilityId });

    const result = await controller.findOne(clubId, facilityId);
    expect(facilitiesService.findOne).toHaveBeenCalledWith(clubId, facilityId);
    expect(result.id).toBe(facilityId);
  });

  it('create debe delegar en facilitiesService.create', async () => {
    const dto = { name: 'Pista 1' };
    facilitiesService.create.mockResolvedValue({ id: facilityId, name: 'Pista 1' });

    const result = await controller.create(clubId, dto as any, 'user-1');
    expect(facilitiesService.create).toHaveBeenCalledWith(clubId, dto, 'user-1');
    expect(result.name).toBe('Pista 1');
  });

  it('update debe delegar en facilitiesService.update', async () => {
    const dto = { name: 'Pista Modificada' };
    facilitiesService.update.mockResolvedValue({ id: facilityId, name: 'Pista Modificada' });

    const result = await controller.update(clubId, facilityId, dto as any, 'user-1');
    expect(facilitiesService.update).toHaveBeenCalledWith(clubId, facilityId, dto, 'user-1');
    expect(result.name).toBe('Pista Modificada');
  });

  it('remove debe delegar en facilitiesService.remove', async () => {
    facilitiesService.remove.mockResolvedValue({ success: true, message: 'Desactivada' });

    const result = await controller.remove(clubId, facilityId, 'user-1');
    expect(facilitiesService.remove).toHaveBeenCalledWith(clubId, facilityId, 'user-1');
    expect(result.success).toBe(true);
  });

  it('findBlocks debe delegar en facilitiesService.findBlocks', async () => {
    facilitiesService.findBlocks.mockResolvedValue([]);

    const result = await controller.findBlocks(clubId, facilityId);
    expect(facilitiesService.findBlocks).toHaveBeenCalledWith(clubId, facilityId);
    expect(result).toEqual([]);
  });

  it('createBlock debe delegar en facilitiesService.createBlock', async () => {
    const dto = { title: 'Mantenimiento', startTime: '2026-10-25T10:00:00Z', endTime: '2026-10-25T12:00:00Z' };
    facilitiesService.createBlock.mockResolvedValue({ id: 'block-1', title: 'Mantenimiento' });

    const result = await controller.createBlock(clubId, facilityId, dto as any, 'user-1');
    expect(facilitiesService.createBlock).toHaveBeenCalledWith(clubId, facilityId, dto, 'user-1');
    expect(result.id).toBe('block-1');
  });

  it('removeBlock debe delegar en facilitiesService.removeBlock', async () => {
    facilitiesService.removeBlock.mockResolvedValue({ success: true });

    const result = await controller.removeBlock(clubId, facilityId, 'block-1', 'user-1');
    expect(facilitiesService.removeBlock).toHaveBeenCalledWith(clubId, facilityId, 'block-1', 'user-1');
    expect(result.success).toBe(true);
  });

  it('findClubBlocks debe delegar en facilitiesService.findClubBlocks', async () => {
    facilitiesService.findClubBlocks.mockResolvedValue([]);

    const result = await controller.findClubBlocks(clubId, undefined, undefined);
    expect(facilitiesService.findClubBlocks).toHaveBeenCalledWith(clubId, undefined, undefined);
    expect(result).toEqual([]);
  });

  it('createBulkBlocks debe delegar en facilitiesService.createBulkBlocks', async () => {
    const dto = {
      facilityIds: ['fac-1', 'fac-2'],
      title: 'Torneo Pádel',
      startTime: '2026-11-01T10:00:00Z',
      endTime: '2026-11-01T14:00:00Z',
    };
    facilitiesService.createBulkBlocks.mockResolvedValue([{ id: 'blk-1' }, { id: 'blk-2' }]);

    const result = await controller.createBulkBlocks(clubId, dto as any, 'user-1');
    expect(facilitiesService.createBulkBlocks).toHaveBeenCalledWith(clubId, dto, 'user-1');
    expect(result).toHaveLength(2);
  });

  it('removeBlockById debe delegar en facilitiesService.removeBlockById', async () => {
    facilitiesService.removeBlockById.mockResolvedValue({ success: true });

    const result = await controller.removeBlockById(clubId, 'block-1', 'user-1');
    expect(facilitiesService.removeBlockById).toHaveBeenCalledWith(clubId, 'block-1', 'user-1');
    expect(result.success).toBe(true);
  });
});
