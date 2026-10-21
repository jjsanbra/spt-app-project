import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourtType, SportType, SurfaceType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { FacilitiesService } from './facilities.service';

describe('FacilitiesService', () => {
  let service: FacilitiesService;
  let prismaMock: any;

  const mockClubId = 'club-test-123';
  const mockFacilityId = 'fac-test-456';

  const mockFacility = {
    id: mockFacilityId,
    clubId: mockClubId,
    name: 'Pista 1 - Pádel Cristal Indoor',
    sportType: SportType.PADEL,
    courtType: CourtType.INDOOR,
    surfaceType: SurfaceType.CRYSTAL,
    hasLighting: true,
    defaultSlotMinutes: 90,
    minPlayers: 4,
    maxPlayers: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      facility: {
        findMany: jest.fn().mockResolvedValue([mockFacility]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === mockFacilityId && where.clubId === mockClubId) {
            return Promise.resolve(mockFacility);
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 'fac-new', ...data, createdAt: new Date(), updatedAt: new Date() }),
        ),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ ...mockFacility, ...data }),
        ),
      },
      facilityBlock: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 'block-new', ...data, createdAt: new Date(), updatedAt: new Date() }),
        ),
        delete: jest.fn().mockResolvedValue({ id: 'block-del' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe consultar instalaciones filtrando estrictamente por clubId (multi-tenant)', async () => {
      const result = await service.findAll(mockClubId, SportType.PADEL, true);

      expect(prismaMock.facility.findMany).toHaveBeenCalledWith({
        where: {
          clubId: mockClubId,
          sportType: SportType.PADEL,
          isActive: true,
        },
        orderBy: [{ sportType: 'asc' }, { name: 'asc' }],
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pista 1 - Pádel Cristal Indoor');
    });
  });

  describe('findOne', () => {
    it('debe retornar la instalación si pertenece al club', async () => {
      const result = await service.findOne(mockClubId, mockFacilityId);
      expect(result.id).toBe(mockFacilityId);
    });

    it('debe lanzar NotFoundException si no pertenece al club del contexto', async () => {
      await expect(service.findOne('otro-club-id', mockFacilityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('debe persistir una nueva pista deportiva asociada al clubId', async () => {
      const dto = {
        name: 'Pista 2 Tenis',
        sportType: SportType.TENNIS,
        courtType: CourtType.OUTDOOR,
        surfaceType: SurfaceType.CLAY,
      };

      const result = await service.create(mockClubId, dto as any);
      expect(prismaMock.facility.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clubId: mockClubId,
          name: 'Pista 2 Tenis',
          sportType: SportType.TENNIS,
          isActive: true,
        }),
      });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('debe actualizar las propiedades de la instalación', async () => {
      const updateDto = {
        name: 'Pista 1 Modificada',
        hasLighting: false,
        defaultSlotMinutes: 60,
        minPlayers: 2,
        maxPlayers: 2,
        isActive: true,
      };

      const result = await service.update(mockClubId, mockFacilityId, updateDto as any);
      expect(prismaMock.facility.update).toHaveBeenCalledWith({
        where: { id: mockFacilityId },
        data: expect.objectContaining({
          name: 'Pista 1 Modificada',
          hasLighting: false,
          defaultSlotMinutes: 60,
          minPlayers: 2,
          maxPlayers: 2,
          isActive: true,
        }),
      });
      expect(result).toBeDefined();
    });
  });

  describe('findBlocks', () => {
    it('debe listar los bloqueos temporales de una instalación', async () => {
      prismaMock.facilityBlock.findMany.mockResolvedValue([
        { id: 'b1', title: 'Torneo', startTime: new Date(), endTime: new Date() },
      ]);

      const result = await service.findBlocks(mockClubId, mockFacilityId);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Torneo');
    });
  });

  describe('removeBlock', () => {
    it('debe lanzar NotFoundException si el bloqueo no existe', async () => {
      prismaMock.facilityBlock.findFirst.mockResolvedValue(null);

      await expect(
        service.removeBlock(mockClubId, mockFacilityId, 'block-inexistente'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe eliminar el bloqueo si existe y pertenece al club y pista', async () => {
      prismaMock.facilityBlock.findFirst.mockResolvedValue({ id: 'b1', clubId: mockClubId, facilityId: mockFacilityId });

      const result = await service.removeBlock(mockClubId, mockFacilityId, 'b1');
      expect(prismaMock.facilityBlock.delete).toHaveBeenCalledWith({
        where: { id: 'b1' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('debe realizar un borrado lógico (isActive = false)', async () => {
      const result = await service.remove(mockClubId, mockFacilityId);
      expect(prismaMock.facility.update).toHaveBeenCalledWith({
        where: { id: mockFacilityId },
        data: { isActive: false },
      });
      expect(result.success).toBeTruthy();
    });
  });

  describe('createBlock', () => {
    it('debe validar que startTime sea anterior a endTime', async () => {
      const invalidDto = {
        title: 'Mantenimiento Red',
        startTime: '2026-10-25T16:00:00.000Z',
        endTime: '2026-10-25T14:00:00.000Z',
      };

      await expect(
        service.createBlock(mockClubId, mockFacilityId, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe crear un bloqueo temporal si el rango de fechas es válido', async () => {
      const validDto = {
        title: 'Torneo Pádel',
        startTime: '2026-10-25T09:00:00.000Z',
        endTime: '2026-10-25T14:00:00.000Z',
      };

      const result = await service.createBlock(mockClubId, mockFacilityId, validDto);
      expect(prismaMock.facilityBlock.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clubId: mockClubId,
          facilityId: mockFacilityId,
          title: 'Torneo Pádel',
        }),
      });
      expect(result).toBeDefined();
    });
  });
});

