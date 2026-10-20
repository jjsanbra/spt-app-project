import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CreateClubDto } from './dto/create-club.dto';
import {
  SuperAdminClubListResponseDto,
  SuperAdminClubResponseDto,
} from './dto/superadmin-club-response.dto';
import { UpdateSuperAdminClubDto } from './dto/update-superadmin-club.dto';
import { SuperAdminClubsService } from './superadmin-clubs.service';

@ApiTags('SuperAdmin - Clubs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller({ path: 'superadmin/clubs', version: '1' })
export class SuperAdminClubsController {
  constructor(private readonly superadminClubsService: SuperAdminClubsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los clubes de la plataforma (Exclusivo SuperAdmin)',
    description: 'Devuelve todos los centros deportivos registrados con filtros y conteos agregados.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre, slug o ciudad' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrar por estado activo/inactivo' })
  @ApiResponse({ status: 200, type: SuperAdminClubListResponseDto })
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ): Promise<SuperAdminClubListResponseDto> {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.superadminClubsService.findAll(search, activeBool);
  }

  @Post()
  @ApiOperation({
    summary: 'Dar de alta un nuevo centro deportivo / Tenant (Exclusivo SuperAdmin)',
    description: 'Crea un nuevo club y opcionalmente asigna al primer OWNER de la organización.',
  })
  @ApiResponse({ status: 201, type: SuperAdminClubResponseDto })
  async create(@Body() dto: CreateClubDto): Promise<SuperAdminClubResponseDto> {
    return this.superadminClubsService.createClub(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle completo de un club por ID (Exclusivo SuperAdmin)',
  })
  @ApiResponse({ status: 200, type: SuperAdminClubResponseDto })
  async findById(@Param('id') id: string): Promise<SuperAdminClubResponseDto> {
    return this.superadminClubsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar configuración o datos de un club (Exclusivo SuperAdmin)',
  })
  @ApiResponse({ status: 200, type: SuperAdminClubResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSuperAdminClubDto,
  ): Promise<SuperAdminClubResponseDto> {
    return this.superadminClubsService.updateClub(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({
    summary: 'Alternar activación de un club (Exclusivo SuperAdmin)',
  })
  @ApiResponse({ status: 200, type: SuperAdminClubResponseDto })
  async toggleStatus(@Param('id') id: string): Promise<SuperAdminClubResponseDto> {
    return this.superadminClubsService.toggleStatus(id);
  }
}
