import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserNextBookingDto {
  @ApiProperty({ description: 'Identificador único de la reserva', example: 'bk-123' })
  id!: string;

  @ApiProperty({ description: 'Nombre de la pista reservada', example: 'Pista 1 Central' })
  facilityName!: string;

  @ApiProperty({ description: 'Deporte de la pista', example: 'PADEL' })
  sportType!: string;

  @ApiProperty({ description: 'Fecha y hora de inicio en formato ISO', example: '2026-10-30T18:00:00.000Z' })
  startTime!: string;

  @ApiProperty({ description: 'Fecha y hora de finalización en formato ISO', example: '2026-10-30T19:30:00.000Z' })
  endTime!: string;
}

export class UserMonthlyStatsDto {
  @ApiProperty({ description: 'Partidos jugados durante el mes actual', example: 6 })
  matchesPlayed!: number;

  @ApiProperty({ description: 'Horas totales jugadas durante el mes', example: 9.0 })
  hoursPlayed!: number;

  @ApiProperty({ description: 'Importe total invertido en reservas este mes en euros', example: 120.0 })
  totalSpent!: number;

  @ApiProperty({ description: 'Nivel estimado de juego / Rating Stitch', example: '3.75 Intermedio' })
  estimatedLevel!: string;
}

export class UserActivityHistoryDto {
  @ApiProperty({ description: 'Nombre o código del mes', example: 'Oct' })
  month!: string;

  @ApiProperty({ description: 'Número de partidos disputados ese mes', example: 8 })
  matchesCount!: number;
}

export class UserDashboardResponseDto {
  @ApiPropertyOptional({ type: UserNextBookingDto, nullable: true, description: 'Próxima reserva inminente del usuario si existe' })
  nextBooking?: UserNextBookingDto | null;

  @ApiProperty({ type: UserMonthlyStatsDto, description: 'Estadísticas deportivas y gasto del mes en curso' })
  monthlyStats!: UserMonthlyStatsDto;

  @ApiProperty({ type: [UserActivityHistoryDto], description: 'Historial de partidos jugados en los últimos meses' })
  activityHistory!: UserActivityHistoryDto[];
}

