import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { SportType } from '@prisma/client';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { BookingsService } from './bookings.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CancelBookingDto, CreateBookingDto } from './dto/create-booking.dto';
import { OpenMatchResponseDto } from './dto/open-match-response.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador único del club (Tenant UUID)',
  required: true,
})
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una reserva de pista completa (FULL)' })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  async create(
    @CurrentTenant('clubId') clubId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.create(clubId, userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar las reservas del usuario autenticado en el club' })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  async findMyBookings(
    @CurrentTenant('clubId') clubId: string,
    @CurrentUser('id') userId: string,
  ): Promise<BookingResponseDto[]> {
    return this.bookingsService.findMyBookings(clubId, userId);
  }

  @Get('open')
  @ApiOperation({ summary: 'Listar partidas abiertas disponibles para unirse en el club' })
  @ApiQuery({ name: 'date', required: false, description: 'Fecha YYYY-MM-DD' })
  @ApiQuery({ name: 'sportType', required: false, enum: SportType, description: 'Filtro por deporte' })
  @ApiResponse({ status: 200, type: [OpenMatchResponseDto] })
  async findOpenMatches(
    @CurrentTenant('clubId') clubId: string,
    @CurrentUser('id') userId: string,
    @Query('date') date?: string,
    @Query('sportType') sportType?: SportType,
  ): Promise<OpenMatchResponseDto[]> {
    return this.bookingsService.findOpenMatches(clubId, userId, date, sportType);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Unirse a una partida abierta por plazas' })
  @ApiResponse({ status: 201, type: OpenMatchResponseDto })
  async joinOpenMatch(
    @CurrentTenant('clubId') clubId: string,
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
  ): Promise<OpenMatchResponseDto> {
    return this.bookingsService.joinOpenMatch(clubId, userId, bookingId);
  }

  @Delete(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Abandonar una partida abierta' })
  @ApiResponse({ status: 200, description: 'Participación cancelada y plaza liberada' })
  async leaveOpenMatch(
    @CurrentTenant('clubId') clubId: string,
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.bookingsService.leaveOpenMatch(clubId, userId, bookingId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar una reserva del usuario autenticado' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  async cancel(
    @CurrentTenant('clubId') clubId: string,
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
    @Body() dto?: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancel(clubId, userId, bookingId, dto);
  }
}
