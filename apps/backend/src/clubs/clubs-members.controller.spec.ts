import { Test, TestingModule } from '@nestjs/testing';
import { ClubRole } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ClubsMembersController } from './clubs-members.controller';
import { ClubsMembersService } from './clubs-members.service';

describe('ClubsMembersController', () => {
  let controller: ClubsMembersController;
  let membersService: {
    findAll: jest.Mock;
    invite: jest.Mock;
    updateRole: jest.Mock;
    updateStatus: jest.Mock;
    remove: jest.Mock;
  };

  const clubId = 'club-uuid-1';
  const memberId = 'mem-uuid-1';

  beforeEach(async () => {
    membersService = {
      findAll: jest.fn(),
      invite: jest.fn(),
      updateRole: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubsMembersController],
      providers: [
        {
          provide: ClubsMembersService,
          useValue: membersService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ClubsMembersController>(ClubsMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll debe delegar en membersService.findAll pasando isActive booleano', async () => {
    membersService.findAll.mockResolvedValue([{ id: memberId }]);

    const result = await controller.findAll(clubId, ClubRole.ADMIN, 'test', 'true');
    expect(membersService.findAll).toHaveBeenCalledWith(clubId, ClubRole.ADMIN, 'test', true);
    expect(result).toHaveLength(1);
  });

  it('findAll debe manejar isActive indefinido', async () => {
    membersService.findAll.mockResolvedValue([]);

    await controller.findAll(clubId, undefined, undefined, undefined);
    expect(membersService.findAll).toHaveBeenCalledWith(clubId, undefined, undefined, undefined);
  });

  it('invite debe delegar en membersService.invite', async () => {
    const inviteDto = { email: 'socio@club.com', role: ClubRole.MEMBER };
    membersService.invite.mockResolvedValue({ id: memberId });

    const result = await controller.invite(clubId, inviteDto);
    expect(membersService.invite).toHaveBeenCalledWith(clubId, inviteDto);
    expect(result.id).toBe(memberId);
  });

  it('updateRole debe delegar en membersService.updateRole', async () => {
    const roleDto = { role: ClubRole.ADMIN };
    membersService.updateRole.mockResolvedValue({ id: memberId, role: ClubRole.ADMIN });

    const result = await controller.updateRole(clubId, memberId, roleDto);
    expect(membersService.updateRole).toHaveBeenCalledWith(clubId, memberId, roleDto);
    expect(result.role).toBe(ClubRole.ADMIN);
  });

  it('updateStatus debe delegar en membersService.updateStatus', async () => {
    const statusDto = { isActive: false };
    membersService.updateStatus.mockResolvedValue({ id: memberId, isActive: false });

    const result = await controller.updateStatus(clubId, memberId, statusDto);
    expect(membersService.updateStatus).toHaveBeenCalledWith(clubId, memberId, statusDto);
    expect(result.isActive).toBe(false);
  });

  it('remove debe delegar en membersService.remove', async () => {
    membersService.remove.mockResolvedValue({ success: true, message: 'Eliminado' });

    const result = await controller.remove(clubId, memberId);
    expect(membersService.remove).toHaveBeenCalledWith(clubId, memberId);
    expect(result.success).toBe(true);
  });
});
