import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: {
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('debe devolver status ok cuando la base de datos responde', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(result.status).toBe('ok');
      expect(result.services.database).toBe('up');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('debe devolver status degraded cuando la base de datos falla', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('Connection timeout'));

      const result = await service.check();

      expect(result.status).toBe('degraded');
      expect(result.services.database).toBe('down');
    });
  });
});
