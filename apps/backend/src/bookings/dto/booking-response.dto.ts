import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, BookingType, SportType } from '@prisma/client';

export class BookingFacilitySummaryDto {
  @ApiProperty({ example: 'fac-uuid-1' })
  id: string;

  @ApiProperty({ example: 'Pista 1 Central' })
  name: string;

  @ApiProperty({ enum: SportType, example: SportType.PADEL })
  sportType: SportType;
}

export class BookingUserSummaryDto {
  @ApiProperty({ example: 'user-uuid-1' })
  id: string;

  @ApiProperty({ example: 'Carlos Martínez' })
  name: string;

  @ApiProperty({ example: 'carlos@ejemplo.com' })
  email: string;
}

export class BookingResponseDto {
  @ApiProperty({ example: 'book-uuid-1' })
  id: string;

  @ApiProperty({ example: 'club-uuid-1' })
  clubId: string;

  @ApiProperty({ example: 'fac-uuid-1' })
  facilityId: string;

  @ApiProperty({ example: 'user-uuid-1' })
  userId: string;

  @ApiProperty({ enum: BookingType, example: BookingType.FULL })
  bookingType: BookingType;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @ApiProperty({ example: '2026-10-25T10:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-10-25T11:30:00.000Z' })
  endTime: Date;

  @ApiProperty({ example: 18.0, description: 'Precio total de la reserva' })
  totalPrice: number;

  @ApiProperty({ example: true, description: 'Si incluye luz artificial' })
  lightIncluded: boolean;

  @ApiPropertyOptional({ example: 'Reserva para partido amistoso', nullable: true })
  notes?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  cancellationReason?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  cancelledAt?: Date | null;

  @ApiProperty({ example: '2026-10-20T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: BookingFacilitySummaryDto })
  facility: BookingFacilitySummaryDto;

  @ApiPropertyOptional({ type: BookingUserSummaryDto })
  user?: BookingUserSummaryDto;
}
