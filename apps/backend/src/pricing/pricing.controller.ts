import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ClubRole } from '@prisma/client';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { PricingRuleResponseDto } from './dto/pricing-rule-response.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { PricingService } from './pricing.service';

@ApiTags('Pricing')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único del club (Tenant UUID)',
  required: true,
})
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las reglas tarifarias del club activo' })
  @ApiQuery({ name: 'facilityId', required: false, description: 'Filtrar por pista específica' })
  @ApiResponse({ status: 200, type: [PricingRuleResponseDto] })
  async findAll(
    @CurrentTenant('clubId') clubId: string,
    @Query('facilityId') facilityId?: string,
  ): Promise<PricingRuleResponseDto[]> {
    return this.pricingService.findAll(clubId, facilityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una regla de precios' })
  @ApiResponse({ status: 200, type: PricingRuleResponseDto })
  async findOne(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') id: string,
  ): Promise<PricingRuleResponseDto> {
    return this.pricingService.findOne(clubId, id);
  }

  @Post()
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Crear una nueva regla tarifaria (Admin)' })
  @ApiResponse({ status: 201, type: PricingRuleResponseDto })
  async create(
    @CurrentTenant('clubId') clubId: string,
    @Body() dto: CreatePricingRuleDto,
  ): Promise<PricingRuleResponseDto> {
    return this.pricingService.create(clubId, dto);
  }

  @Put(':id')
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Actualizar regla tarifaria (Admin)' })
  @ApiResponse({ status: 200, type: PricingRuleResponseDto })
  async update(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePricingRuleDto,
  ): Promise<PricingRuleResponseDto> {
    return this.pricingService.update(clubId, id, dto);
  }

  @Delete(':id')
  @Roles(ClubRole.ADMIN, ClubRole.OWNER)
  @ApiOperation({ summary: 'Eliminar regla tarifaria (Admin)' })
  @ApiResponse({ status: 200, description: 'Regla eliminada correctamente' })
  async remove(
    @CurrentTenant('clubId') clubId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.pricingService.remove(clubId, id);
  }
}
