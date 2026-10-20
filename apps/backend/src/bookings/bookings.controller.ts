import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { BookingsService } from './bookings.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CancelBookingDto, CreateBookingDto } from './dto/create-booking.dto';

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
