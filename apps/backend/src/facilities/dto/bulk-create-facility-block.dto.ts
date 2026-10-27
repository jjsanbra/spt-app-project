import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class BulkCreateFacilityBlockDto {
  @ApiProperty({
    type: [String],
    description: 'Listado de IDs de pistas a bloquear (mínimo 1)',
    example: ['fac-816b62-92d3-4a9d-86df-87d547e457ec'],
  })
  @IsArray({ message: 'facilityIds debe ser un array de identificadores' })
  @ArrayNotEmpty({ message: 'Debe seleccionar al menos una pista' })
  @IsString({ each: true, message: 'Cada ID de pista debe ser una cadena de texto' })
  facilityIds: string[];

  @ApiProperty({
    example: 'Mantenimiento o Torneo Fin de Semana',
    description: 'Título o concepto del bloqueo de pista',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título del bloqueo es obligatorio' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El título no puede superar los 150 caracteres' })
  title: string;

  @ApiPropertyOptional({
    example: 'Revisión técnica o reserva para torneo de pádel',
    description: 'Motivo o detalle explicativo adicional del bloqueo',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: '2026-11-01T08:00:00.000Z',
    description: 'Fecha y hora de inicio del bloqueo (formato ISO 8601)',
  })
  @IsDateString({}, { message: 'startTime debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  startTime: string;

  @ApiProperty({
    example: '2026-11-01T15:00:00.000Z',
    description: 'Fecha y hora de finalización del bloqueo (formato ISO 8601)',
  })
  @IsDateString({}, { message: 'endTime debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  endTime: string;
}
