import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFacilityBlockDto {
  @ApiProperty({
    example: 'Mantenimiento focos y red',
    description: 'Título o concepto del bloqueo de pista',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título del bloqueo es obligatorio' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El título no puede superar los 150 caracteres' })
  title: string;

  @ApiPropertyOptional({
    example: 'Revisión técnica anual de iluminación y tensión de red',
    description: 'Motivo o detalle explicativo adicional del bloqueo',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: '2026-10-25T10:00:00.000Z',
    description: 'Fecha y hora de inicio del bloqueo (formato ISO 8601)',
  })
  @IsDateString({}, { message: 'startTime debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  startTime: string;

  @ApiProperty({
    example: '2026-10-25T14:00:00.000Z',
    description: 'Fecha y hora de finalización del bloqueo (formato ISO 8601)',
  })
  @IsDateString({}, { message: 'endTime debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  endTime: string;
}
