import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Query,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsPaginatedResponseDto } from './dto/activity-log-response.dto';
import { QueryActivityLogsDto } from './dto/query-activity-logs.dto';

@ApiTags('ActivityLogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1' })
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * Consulta de actividades del club para administradores (OWNER, ADMIN o SUPER_ADMIN)
   */
  @Get('clubs/:clubId/activity-logs')
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Identificador único del club (Tenant UUID)',
    required: true,
  })
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Obtener logs de auditoría del club con filtros y paginación' })
  @ApiResponse({ status: 200, type: ActivityLogsPaginatedResponseDto })
  async findClubLogs(
    @CurrentTenant('clubId') tenantClubId: string,
    @Param('clubId') clubId: string,
    @Query() query: QueryActivityLogsDto,
  ): Promise<ActivityLogsPaginatedResponseDto> {
    return this.activityLogsService.findClubLogs(tenantClubId || clubId, query);
  }

  /**
   * Consulta de actividades propias del usuario autenticado ("Mi Actividad")
   */
  @Get('users/me/activity-logs')
  @ApiOperation({ summary: 'Obtener historial de actividades propio del usuario autenticado' })
  @ApiResponse({ status: 200, type: ActivityLogsPaginatedResponseDto })
  async findMyLogs(
    @CurrentUser('id') userId: string,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: QueryActivityLogsDto,
  ): Promise<ActivityLogsPaginatedResponseDto> {
    return this.activityLogsService.findUserLogs(userId, tenantId || null, query);
  }

  /**
   * Consulta global de auditoría transversal para SuperAdmin
   */
  @Get('superadmin/activity-logs')
  @ApiOperation({ summary: 'Obtener historial global de auditoría transversal de la plataforma (SuperAdmin)' })
  @ApiResponse({ status: 200, type: ActivityLogsPaginatedResponseDto })
  async findSuperAdminLogs(
    @CurrentUser() user: any,
    @Query() query: QueryActivityLogsDto,
  ): Promise<ActivityLogsPaginatedResponseDto> {
    if (!user?.isSuperAdmin) {
      throw new ForbiddenException('Solo los superadministradores pueden consultar la auditoría global');
    }
    return this.activityLogsService.findSuperAdminLogs(query);
  }
}
