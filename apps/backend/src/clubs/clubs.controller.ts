import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ClubsService } from './clubs.service';
import { ClubSettingsResponseDto } from './dto/club-settings-response.dto';
import { UpdateClubSettingsDto } from './dto/update-club-settings.dto';

@ApiTags('Clubs - Settings')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único del club (Tenant UUID)',
  required: true,
})
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller({ path: 'clubs/settings', version: '1' })
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @ApiOperation({ summary: 'Obtener configuración y horarios del club activo' })
  @ApiResponse({ status: 200, type: ClubSettingsResponseDto })
  async getSettings(
    @CurrentTenant('clubId') clubId: string,
  ): Promise<ClubSettingsResponseDto> {
    return this.clubsService.getSettings(clubId);
  }

  @Patch()
  @Roles(ClubRole.OWNER, ClubRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar configuración, horarios y modo de pago del club activo' })
  @ApiResponse({ status: 200, type: ClubSettingsResponseDto })
  async updateSettings(
    @CurrentTenant('clubId') clubId: string,
    @Body() dto: UpdateClubSettingsDto,
  ): Promise<ClubSettingsResponseDto> {
    return this.clubsService.updateSettings(clubId, dto);
  }
}
