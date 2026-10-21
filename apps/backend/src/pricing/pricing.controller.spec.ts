import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/database/prisma.service';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

describe('PricingController', () => {
  let controller: PricingController;
  let pricingService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const clubId = 'club-uuid-1';
  const ruleId = 'rule-uuid-1';

  beforeEach(async () => {
    pricingService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingController],
      providers: [
        {
          provide: PricingService,
          useValue: pricingService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PricingController>(PricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll debe delegar en pricingService.findAll', async () => {
    pricingService.findAll.mockResolvedValue([{ id: ruleId }]);

    const result = await controller.findAll(clubId, 'fac-1');
    expect(pricingService.findAll).toHaveBeenCalledWith(clubId, 'fac-1');
    expect(result).toHaveLength(1);
  });

  it('findOne debe delegar en pricingService.findOne', async () => {
    pricingService.findOne.mockResolvedValue({ id: ruleId });

    const result = await controller.findOne(clubId, ruleId);
    expect(pricingService.findOne).toHaveBeenCalledWith(clubId, ruleId);
    expect(result.id).toBe(ruleId);
  });

  it('create debe delegar en pricingService.create', async () => {
    const dto = { memberPrice: 20, guestPrice: 30 };
    pricingService.create.mockResolvedValue({ id: ruleId, memberPrice: 20 });

    const result = await controller.create(clubId, dto as any);
    expect(pricingService.create).toHaveBeenCalledWith(clubId, dto);
    expect(result.id).toBe(ruleId);
  });

  it('update debe delegar en pricingService.update', async () => {
    const dto = { memberPrice: 25 };
    pricingService.update.mockResolvedValue({ id: ruleId, memberPrice: 25 });

    const result = await controller.update(clubId, ruleId, dto as any);
    expect(pricingService.update).toHaveBeenCalledWith(clubId, ruleId, dto);
    expect(result.memberPrice).toBe(25);
  });

  it('remove debe delegar en pricingService.remove', async () => {
    pricingService.remove.mockResolvedValue({ success: true, message: 'Eliminada' });

    const result = await controller.remove(clubId, ruleId);
    expect(pricingService.remove).toHaveBeenCalledWith(clubId, ruleId);
    expect(result.success).toBe(true);
  });
});
