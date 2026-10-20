import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourtType, SportType, SurfaceType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFacilityDto {
  @ApiProperty({
    example: 'Pista 1 - Pádel Cristal Indoor',
    description: 'Nombre identificativo de la pista o instalación deportiva',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la instalación es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @ApiProperty({
    enum: SportType,
    example: SportType.PADEL,
    description: 'Deporte principal para el que está habilitada la pista',
  })
  @IsEnum(SportType, { message: 'El tipo de deporte no es válido' })
  @IsNotEmpty({ message: 'El tipo de deporte es obligatorio' })
  sportType: SportType;

  @ApiPropertyOptional({
    enum: CourtType,
    example: CourtType.INDOOR,
    default: CourtType.OUTDOOR,
    description: 'Ubicación y cubierta de la pista (INDOOR, OUTDOOR, COVERED)',
  })
  @IsEnum(CourtType, { message: 'El tipo de pista no es válido' })
  @IsOptional()
  courtType?: CourtType;

  @ApiPropertyOptional({
    enum: SurfaceType,
    example: SurfaceType.CRYSTAL,
    default: SurfaceType.SYNTHETIC_GRASS,
    description: 'Superficie de juego (CRYSTAL, CLAY, SYNTHETIC_GRASS, etc.)',
  })
  @IsEnum(SurfaceType, { message: 'El tipo de superficie no es válido' })
  @IsOptional()
  surfaceType?: SurfaceType;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Indica si la pista dispone de sistema de iluminación artificial',
  })
  @IsBoolean({ message: 'hasLighting debe ser un valor booleano' })
  @IsOptional()
  hasLighting?: boolean;

  @ApiPropertyOptional({
    example: 90,
    default: 90,
    description: 'Duración por defecto de cada franja de reserva en minutos (30, 60, 90, 120)',
  })
  @IsInt({ message: 'La duración de franja debe ser un número entero' })
  @Min(30, { message: 'La duración mínima de franja es de 30 minutos' })
  @Max(240, { message: 'La duración máxima de franja es de 240 minutos' })
  @IsOptional()
  defaultSlotMinutes?: number;

  @ApiPropertyOptional({
    example: 4,
    default: 4,
    description: 'Número mínimo de jugadores requeridos para reservar',
  })
  @IsInt({ message: 'minPlayers debe ser un número entero' })
  @Min(1, { message: 'Debe permitir al menos 1 jugador' })
  @Max(50, { message: 'No puede exceder 50 jugadores' })
  @IsOptional()
  minPlayers?: number;

  @ApiPropertyOptional({
    example: 4,
    default: 4,
    description: 'Número máximo de jugadores admitidos en la pista',
  })
  @IsInt({ message: 'maxPlayers debe ser un número entero' })
  @Min(1, { message: 'Debe admitir al menos 1 jugador' })
  @Max(50, { message: 'No puede exceder 50 jugadores' })
  @IsOptional()
  maxPlayers?: number;
}
