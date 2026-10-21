import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: {
    check: jest.Mock;
  };

  beforeEach(async () => {
    healthService = {
      check: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: healthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('check debe delegar en healthService.check', async () => {
    healthService.check.mockResolvedValue({ status: 'ok', services: { database: 'up' } });

    const result = await controller.check();
    expect(healthService.check).toHaveBeenCalled();
    expect(result.status).toBe('ok');
  });
});
