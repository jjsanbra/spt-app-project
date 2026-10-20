import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingType } from '@prisma/client';
import { IsBoolean, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'fac-uuid-1',
    description: 'Identificador único de la pista o instalación deportiva',
  })
  @IsUUID('4', { message: 'El ID de instalación debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la instalación es obligatorio' })
  facilityId: string;

  @ApiProperty({
    example: '2026-10-25T10:00:00.000Z',
    description: 'Fecha y hora de inicio de la reserva en formato ISO 8601',
  })
  @IsISO8601({}, { message: 'La fecha de inicio debe tener formato ISO 8601 válido' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  startTime: string;

  @ApiProperty({
    example: '2026-10-25T11:30:00.000Z',
    description: 'Fecha y hora de fin de la reserva en formato ISO 8601',
  })
  @IsISO8601({}, { message: 'La fecha de fin debe tener formato ISO 8601 válido' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  endTime: string;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Indica si se solicita encendido de iluminación en la pista',
  })
  @IsOptional()
  @IsBoolean({ message: 'lightIncluded debe ser un booleano' })
  lightIncluded?: boolean = false;

  @ApiPropertyOptional({
    example: 'Reserva para partido del torneo interno',
    description: 'Notas o comentarios adicionales sobre la reserva',
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notes?: string;

  @ApiPropertyOptional({
    enum: BookingType,
    example: BookingType.FULL,
    default: BookingType.FULL,
    description: 'Tipo de reserva: FULL (pista completa cerrada) u OPEN (partida abierta por plazas)',
  })
  @IsOptional()
  @IsEnum(BookingType, { message: 'El tipo de reserva debe ser FULL u OPEN' })
  bookingType?: BookingType = BookingType.FULL;
}

export class CancelBookingDto {
  @ApiPropertyOptional({
    example: 'Imposibilidad de asistencia por motivos laborales',
    description: 'Motivo de la cancelación de la reserva',
  })
  @IsOptional()
  @IsString({ message: 'El motivo de cancelación debe ser texto' })
  cancellationReason?: string;
}
