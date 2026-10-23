import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;
  let prismaMock: any;

  const mockClubId = 'club-test-123';
  const mockRuleId = 'rule-test-456';

  const mockRule = {
    id: mockRuleId,
    clubId: mockClubId,
    facilityId: null,
    sportType: SportType.PADEL,
    name: 'Tarifa Estándar Mañanas (Valle)',
    isPeakHour: false,
    startTime: '08:00',
    endTime: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    memberPrice: 16.0,
    guestPrice: 24.0,
    lightSurcharge: 0.0,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      pricingRule: {
        findMany: jest.fn().mockResolvedValue([mockRule]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === mockRuleId && where.clubId === mockClubId) {
            return Promise.resolve(mockRule);
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 'rule-new', ...data, createdAt: new Date(), updatedAt: new Date() }),
        ),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ ...mockRule, ...data }),
        ),
        delete: jest.fn().mockResolvedValue(mockRule),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe consultar reglas de tarifas filtrando por clubId e incluir facility', async () => {
      const mockRuleWithFacility = {
        ...mockRule,
        facilityId: 'fac-1',
        facility: { name: 'Pista 1 Central' },
      };
      prismaMock.pricingRule.findMany.mockResolvedValueOnce([mockRuleWithFacility]);

      const result = await service.findAll(mockClubId);

      expect(prismaMock.pricingRule.findMany).toHaveBeenCalledWith({
        where: { clubId: mockClubId },
        include: { facility: { select: { name: true } } },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tarifa Estándar Mañanas (Valle)');
      expect(result[0].memberPrice).toBe(16.0);
      expect(result[0].facilityName).toBe('Pista 1 Central');
    });

    it('debe filtrar por facilityId si se proporciona en los parámetros', async () => {
      await service.findAll(mockClubId, 'fac-1');

      expect(prismaMock.pricingRule.findMany).toHaveBeenCalledWith({
        where: { clubId: mockClubId, facilityId: 'fac-1' },
        include: { facility: { select: { name: true } } },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar la regla con facilityName mapeado', async () => {
      const mockRuleWithFacility = {
        ...mockRule,
        facilityId: 'fac-1',
        facility: { name: 'Pista 1 Central' },
      };
      prismaMock.pricingRule.findFirst.mockResolvedValueOnce(mockRuleWithFacility);

      const result = await service.findOne(mockClubId, mockRuleId);

      expect(result.id).toBe(mockRuleId);
      expect(result.facilityName).toBe('Pista 1 Central');
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      prismaMock.pricingRule.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne(mockClubId, 'no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('debe crear una nueva regla tarifaria', async () => {
      const dto = {
        name: 'Tarifa Fines de Semana',
        daysOfWeek: [6, 0],
        memberPrice: 20.0,
        guestPrice: 28.0,
        lightSurcharge: 4.0,
      };

      const result = await service.create(mockClubId, dto as any);
      expect(prismaMock.pricingRule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clubId: mockClubId,
          name: 'Tarifa Fines de Semana',
          memberPrice: 20.0,
        }),
        include: { facility: { select: { name: true } } },
      });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('debe actualizar una regla tarifaria existente', async () => {
      const dto = {
        name: 'Tarifa Modificada',
        memberPrice: 25.0,
      };

      const result = await service.update(mockClubId, mockRuleId, dto as any);
      expect(prismaMock.pricingRule.update).toHaveBeenCalledWith({
        where: { id: mockRuleId },
        data: expect.objectContaining({
          name: 'Tarifa Modificada',
          memberPrice: 25.0,
        }),
        include: { facility: { select: { name: true } } },
      });
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('debe eliminar la regla si pertenece al club', async () => {
      const result = await service.remove(mockClubId, mockRuleId);
      expect(prismaMock.pricingRule.delete).toHaveBeenCalledWith({
        where: { id: mockRuleId },
      });
      expect(result.success).toBeTruthy();
    });

    it('debe lanzar NotFoundException si la regla no pertenece al club', async () => {
      await expect(service.remove('otro-club', mockRuleId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
