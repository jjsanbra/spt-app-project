import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SportType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePricingRuleDto {
  @ApiProperty({
    example: 'Tarifa Estándar Mañanas (Valle)',
    description: 'Nombre descriptivo de la regla tarifaria',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la tarifa es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: 'ba916b62-92d3-4a9d-86df-87d547e457ea',
    description: 'ID de instalación específica a la que aplica la tarifa (null = todas)',
    nullable: true,
  })
  @IsUUID('4', { message: 'facilityId debe ser un UUID válido' })
  @IsOptional()
  facilityId?: string | null;

  @ApiPropertyOptional({
    enum: SportType,
    example: SportType.PADEL,
    description: 'Deporte al que aplica la regla tarifaria (null = todos)',
    nullable: true,
  })
  @IsEnum(SportType, { message: 'El deporte no es válido' })
  @IsOptional()
  sportType?: SportType | null;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Indica si se considera hora punta (alta demanda)',
  })
  @IsBoolean({ message: 'isPeakHour debe ser un valor booleano' })
  @IsOptional()
  isPeakHour?: boolean;

  @ApiPropertyOptional({
    example: '08:00',
    description: 'Hora de inicio de la franja (formato HH:mm)',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime debe tener formato HH:mm (ej. 08:00)',
  })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    example: '17:00',
    description: 'Hora de fin de la franja (formato HH:mm)',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime debe tener formato HH:mm (ej. 17:00)',
  })
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3, 4, 5],
    description: 'Días de la semana en los que aplica (1=Lunes, 7=Domingo o 0=Domingo)',
  })
  @IsArray({ message: 'daysOfWeek debe ser un array de números' })
  @IsInt({ each: true, message: 'Cada día de la semana debe ser un entero (0-7)' })
  @IsNotEmpty({ message: 'Debe especificarse al menos un día de la semana' })
  daysOfWeek: number[];

  @ApiProperty({
    example: 16.0,
    description: 'Precio aplicable para socios del club (en euros)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'memberPrice debe ser un número decimal' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  memberPrice: number;

  @ApiProperty({
    example: 24.0,
    description: 'Precio aplicable para usuarios no socios / invitados (en euros)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'guestPrice debe ser un número decimal' })
  @Min(0, { message: 'El precio de invitado no puede ser negativo' })
  guestPrice: number;

  @ApiPropertyOptional({
    example: 0.0,
    default: 0.0,
    description: 'Suplemento añadido por uso de iluminación artificial',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'lightSurcharge debe ser un número decimal' })
  @Min(0, { message: 'El suplemento de luz no puede ser negativo' })
  @IsOptional()
  lightSurcharge?: number;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Prioridad de evaluación de la regla (mayor número = mayor precedencia)',
  })
  @IsInt({ message: 'priority debe ser un número entero' })
  @Min(1, { message: 'La prioridad mínima es 1' })
  @Max(100, { message: 'La prioridad máxima es 100' })
  @IsOptional()
  priority?: number;
}
