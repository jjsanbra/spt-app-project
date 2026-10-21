import { Test, TestingModule } from '@nestjs/testing';
import { SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: {
    create: jest.Mock;
    findMyBookings: jest.Mock;
    findOpenMatches: jest.Mock;
    joinOpenMatch: jest.Mock;
    leaveOpenMatch: jest.Mock;
    cancel: jest.Mock;
  };

  const clubId = 'club-1';
  const userId = 'user-1';

  beforeEach(async () => {
    bookingsService = {
      create: jest.fn(),
      findMyBookings: jest.fn(),
      findOpenMatches: jest.fn(),
      joinOpenMatch: jest.fn(),
      leaveOpenMatch: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: bookingsService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create debe delegar en bookingsService.create', async () => {
    const dto = { facilityId: 'fac-1', startTime: '2026-10-25T10:00:00Z', durationMinutes: 90 };
    bookingsService.create.mockResolvedValue({ id: 'b1' });

    const result = await controller.create(clubId, userId, dto as any);
    expect(bookingsService.create).toHaveBeenCalledWith(clubId, userId, dto);
    expect(result.id).toBe('b1');
  });

  it('findMyBookings debe delegar en bookingsService.findMyBookings', async () => {
    bookingsService.findMyBookings.mockResolvedValue([{ id: 'b1' }]);

    const result = await controller.findMyBookings(clubId, userId);
    expect(bookingsService.findMyBookings).toHaveBeenCalledWith(clubId, userId);
    expect(result).toHaveLength(1);
  });

  it('findOpenMatches debe delegar con filtros de fecha y deporte', async () => {
    bookingsService.findOpenMatches.mockResolvedValue([{ id: 'm1' }]);

    const result = await controller.findOpenMatches(clubId, userId, '2026-10-25', SportType.PADEL);
    expect(bookingsService.findOpenMatches).toHaveBeenCalledWith(clubId, userId, '2026-10-25', SportType.PADEL);
    expect(result).toHaveLength(1);
  });

  it('joinOpenMatch debe delegar en bookingsService.joinOpenMatch', async () => {
    bookingsService.joinOpenMatch.mockResolvedValue({ id: 'm1' });

    const result = await controller.joinOpenMatch(clubId, userId, 'm1');
    expect(bookingsService.joinOpenMatch).toHaveBeenCalledWith(clubId, userId, 'm1');
    expect(result.id).toBe('m1');
  });

  it('leaveOpenMatch debe delegar en bookingsService.leaveOpenMatch', async () => {
    bookingsService.leaveOpenMatch.mockResolvedValue({ success: true, message: 'Abandonado' });

    const result = await controller.leaveOpenMatch(clubId, userId, 'm1');
    expect(bookingsService.leaveOpenMatch).toHaveBeenCalledWith(clubId, userId, 'm1');
    expect(result.success).toBe(true);
  });

  it('cancel debe delegar en bookingsService.cancel', async () => {
    const cancelDto = { cancellationReason: 'Lesión' };
    bookingsService.cancel.mockResolvedValue({ id: 'b1', status: 'CANCELLED' });

    const result = await controller.cancel(clubId, userId, 'b1', cancelDto);
    expect(bookingsService.cancel).toHaveBeenCalledWith(clubId, userId, 'b1', cancelDto);
    expect(result.id).toBe('b1');
  });
});
