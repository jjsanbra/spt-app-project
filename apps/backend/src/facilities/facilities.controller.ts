import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { ClubRole, SportType } from '@prisma/client';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CreateFacilityBlockDto } from './dto/create-facility-block.dto';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { FacilityBlockResponseDto } from './dto/facility-block-response.dto';
import { FacilityResponseDto } from './dto/facility-response.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { FacilitiesService } from './facilities.service';

@ApiTags('Facilities')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único del club (Tenant UUID)',
  required: true,
})
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // ─── Pistas / Instalaciones ────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Listar todas las instalaciones deportivas del club activo' })
  @ApiQuery({ name: 'sportType', enum: SportType, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiResponse({ status: 200, type: [FacilityResponseDto] })
  async findAll(
    @CurrentTenant('clubId') clubId: string,
    @Query('sportType') sportType?: SportType,
    @Query('isActive') isActive?: string,
  ): Promise<FacilityResponseDto[]> {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.facilitiesService.findAll(clubId, sportType, activeBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una instalación deportiva' })
  @ApiResponse({ status: 200, type: FacilityResponseDto })
  async findOne(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') id: string,
  ): Promise<FacilityResponseDto> {
    return this.facilitiesService.findOne(clubId, id);
  }

  @Post()
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Crear una nueva pista o instalación deportiva (Admin)' })
  @ApiResponse({ status: 201, type: FacilityResponseDto })
  async create(
    @CurrentTenant('clubId') clubId: string,
    @Body() dto: CreateFacilityDto,
  ): Promise<FacilityResponseDto> {
    return this.facilitiesService.create(clubId, dto);
  }

  @Put(':id')
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Actualizar datos de una instalación deportiva (Admin)' })
  @ApiResponse({ status: 200, type: FacilityResponseDto })
  async update(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFacilityDto,
  ): Promise<FacilityResponseDto> {
    return this.facilitiesService.update(clubId, id, dto);
  }

  @Delete(':id')
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Desactivar instalación deportiva (Borrado lógico) (Admin)' })
  @ApiResponse({ status: 200, description: 'Instalación desactivada con éxito' })
  async remove(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.facilitiesService.remove(clubId, id);
  }

  // ─── Bloqueos de Instalación ───────────────────────────────

  @Get(':id/blocks')
  @ApiOperation({ summary: 'Listar bloqueos temporales de una instalación' })
  @ApiResponse({ status: 200, type: [FacilityBlockResponseDto] })
  async findBlocks(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') facilityId: string,
  ): Promise<FacilityBlockResponseDto[]> {
    return this.facilitiesService.findBlocks(clubId, facilityId);
  }

  @Post(':id/blocks')
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Crear un bloqueo temporal de pista (Admin)' })
  @ApiResponse({ status: 201, type: FacilityBlockResponseDto })
  async createBlock(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') facilityId: string,
    @Body() dto: CreateFacilityBlockDto,
  ): Promise<FacilityBlockResponseDto> {
    return this.facilitiesService.createBlock(clubId, facilityId, dto);
  }

  @Delete(':id/blocks/:blockId')
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar o levantar bloqueo temporal (Admin)' })
  @ApiResponse({ status: 200, description: 'Bloqueo eliminado correctamente' })
  async removeBlock(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') facilityId: string,
    @Param('blockId') blockId: string,
  ): Promise<{ success: boolean }> {
    return this.facilitiesService.removeBlock(clubId, facilityId, blockId);
  }
}
