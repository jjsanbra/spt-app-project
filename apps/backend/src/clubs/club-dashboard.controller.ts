import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ClubsService } from './clubs.service';
import {
  ClubDashboardResponseDto,
  ClubOperationalDashboardResponseDto,
} from './dto/club-dashboard-response.dto';

@ApiTags('Clubs - Dashboard')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único del club (Tenant UUID)',
  required: true,
})
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller({ path: 'clubs/dashboard', version: '1' })
export class ClubDashboardController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @ApiOperation({ summary: 'Obtener dashboard analítico integral del club para Owners y Administradores' })
  @ApiResponse({ status: 200, type: ClubDashboardResponseDto })
  async getDashboard(
    @CurrentTenant('clubId') clubId: string,
  ): Promise<ClubDashboardResponseDto> {
    return this.clubsService.getDashboard(clubId);
  }

  @Get('operational')
  @Roles(ClubRole.OWNER, ClubRole.ADMIN, ClubRole.STAFF)
  @ApiOperation({ summary: 'Obtener dashboard operativo de hoy del club para Staff y Recepción' })
  @ApiResponse({ status: 200, type: ClubOperationalDashboardResponseDto })
  async getOperationalDashboard(
    @CurrentTenant('clubId') clubId: string,
  ): Promise<ClubOperationalDashboardResponseDto> {
    return this.clubsService.getOperationalDashboard(clubId);
  }
}

