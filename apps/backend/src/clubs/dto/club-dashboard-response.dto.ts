import { ApiProperty } from '@nestjs/swagger';

export class ClubDashboardTodayDto {
  @ApiProperty({ description: 'Total de reservas registradas para hoy', example: 14 })
  totalBookings!: number;

  @ApiProperty({ description: 'Porcentaje de ocupación de pistas hoy (0-100)', example: 68.5 })
  occupancyPercent!: number;

  @ApiProperty({ description: 'Pistas libres disponibles en las próximas 3 horas', example: 3 })
  availableCourtsNext3Hours!: number;

  @ApiProperty({ description: 'Número de reservas de hoy pendientes de pago', example: 2 })
  pendingPaymentsCount!: number;

  @ApiProperty({ description: 'Bloqueos de pista activos durante el día de hoy', example: 1 })
  activeBlocksCount!: number;
}

export class ClubDashboardMonthDto {
  @ApiProperty({ description: 'Facturación total del mes en curso en euros', example: 4850.0 })
  totalRevenue!: number;

  @ApiProperty({ description: 'Porcentaje de crecimiento de facturación respecto al mes anterior', example: 12.4 })
  revenueGrowthPercent!: number;

  @ApiProperty({ description: 'Porcentaje medio de ocupación de pistas en el mes', example: 62.0 })
  occupancyPercent!: number;

  @ApiProperty({ description: 'Ticket medio por reserva en euros', example: 28.5 })
  averageTicketPrice!: number;

  @ApiProperty({ description: 'Nuevas altas de socios en el club durante este mes', example: 9 })
  newMembersCount!: number;
}

export class ClubRevenueBySportDto {
  @ApiProperty({ description: 'Identificador del deporte', example: 'PADEL' })
  sportType!: string;

  @ApiProperty({ description: 'Etiqueta legible del deporte', example: 'Pádel' })
  label!: string;

  @ApiProperty({ description: 'Ingresos generados por el deporte en euros', example: 3400.0 })
  amount!: number;

  @ApiProperty({ description: 'Porcentaje sobre el total de ingresos del club', example: 70.1 })
  percent!: number;
}

export class ClubOccupancyTrendDto {
  @ApiProperty({ description: 'Fecha en formato ISO YYYY-MM-DD', example: '2026-10-28' })
  date!: string;

  @ApiProperty({ description: 'Etiqueta legible de la fecha', example: '28 Oct' })
  label!: string;

  @ApiProperty({ description: 'Número total de reservas ese día', example: 18 })
  bookingsCount!: number;

  @ApiProperty({ description: 'Porcentaje de ocupación alcanzado ese día', example: 75.0 })
  occupancyPercent!: number;
}

export class ClubDashboardResponseDto {
  @ApiProperty({ type: ClubDashboardTodayDto, description: 'Métricas operativas del día de hoy (Staff y Owner)' })
  today!: ClubDashboardTodayDto;

  @ApiProperty({ type: ClubDashboardMonthDto, description: 'Métricas de rendimiento y negocio del mes (Owner)' })
  month!: ClubDashboardMonthDto;

  @ApiProperty({ type: [ClubRevenueBySportDto], description: 'Distribución de facturación por deporte' })
  revenueBySport!: ClubRevenueBySportDto[];

  @ApiProperty({ type: [ClubOccupancyTrendDto], description: 'Serie temporal de ocupación de los últimos 14 días' })
  occupancyTrend!: ClubOccupancyTrendDto[];
}

export class ClubOperationalDashboardResponseDto {
  @ApiProperty({ type: ClubDashboardTodayDto, description: 'Métricas operativas inmediatas de hoy para Staff' })
  today!: ClubDashboardTodayDto;
}

