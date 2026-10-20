import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ClubsMembersService } from './clubs-members.service';
import { ClubMemberResponseDto } from './dto/club-member-response.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto';

@ApiTags('Clubs - Members')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único del club (Tenant UUID)',
  required: true,
})
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller({ path: 'clubs/members', version: '1' })
export class ClubsMembersController {
  constructor(private readonly membersService: ClubsMembersService) {}

  @Get()
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @ApiOperation({ summary: 'Listar socios y miembros del club activo' })
  @ApiQuery({ name: 'role', enum: ClubRole, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiResponse({ status: 200, type: [ClubMemberResponseDto] })
  async findAll(
    @CurrentTenant('clubId') clubId: string,
    @Query('role') role?: ClubRole,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ClubMemberResponseDto[]> {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.membersService.findAll(clubId, role, search, activeBool);
  }

  @Post('invite')
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @ApiOperation({ summary: 'Invitar o vincular un socio al club' })
  @ApiResponse({ status: 201, type: ClubMemberResponseDto })
  async invite(
    @CurrentTenant('clubId') clubId: string,
    @Body() dto: InviteMemberDto,
  ): Promise<ClubMemberResponseDto> {
    return this.membersService.invite(clubId, dto);
  }

  @Patch(':id/role')
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @ApiOperation({ summary: 'Modificar el rol de un miembro del club' })
  @ApiResponse({ status: 200, type: ClubMemberResponseDto })
  async updateRole(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') membershipId: string,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<ClubMemberResponseDto> {
    return this.membersService.updateRole(clubId, membershipId, dto);
  }

  @Patch(':id/status')
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @ApiOperation({ summary: 'Activar o desactivar la membresía de un miembro' })
  @ApiResponse({ status: 200, type: ClubMemberResponseDto })
  async updateStatus(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') membershipId: string,
    @Body() dto: UpdateMemberStatusDto,
  ): Promise<ClubMemberResponseDto> {
    return this.membersService.updateStatus(clubId, membershipId, dto);
  }

  @Delete(':id')
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar la membresía de un socio del club' })
  @ApiResponse({ status: 200, description: 'Membresía eliminada' })
  async remove(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') membershipId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.membersService.remove(clubId, membershipId);
  }
}
