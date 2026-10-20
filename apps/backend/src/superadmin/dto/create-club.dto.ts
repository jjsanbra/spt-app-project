import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateClubDto {
  @ApiProperty({ example: 'Club Deportivo Las Rozas', description: 'Nombre oficial del club deportivo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del club es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres' })
  name: string;

  @ApiProperty({
    example: 'las-rozas-padel',
    description: 'Identificador URL único (alfanumérico y guiones en minúsculas)',
  })
  @IsString()
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones (ej: club-madrid-padel)',
  })
  slug: string;

  @ApiProperty({ example: 'info@lasrozas.local', description: 'Email oficial de contacto' })
  @IsEmail({}, { message: 'El formato de email no es válido' })
  @IsNotEmpty({ message: 'El email del club es obligatorio' })
  email: string;

  @ApiPropertyOptional({ example: 'Centro deportivo con 8 pistas de pádel y tenis' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '+34910000002' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'Avenida del Deporte, 10' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Las Rozas' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: '28230' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 8, default: 8, description: 'Hora de apertura (0-23)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  openingHour?: number = 8;

  @ApiPropertyOptional({ example: 23, default: 23, description: 'Hora de cierre (1-24)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  closingHour?: number = 23;

  @ApiPropertyOptional({ example: 60, default: 60, description: 'Duración por defecto de franjas' })
  @IsOptional()
  @IsInt()
  @IsIn([30, 60, 90, 120])
  slotDurationMinutes?: number = 60;

  @ApiPropertyOptional({ example: 2, default: 2, description: 'Antelación mínima para partidas abiertas (horas)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  openGameMinNoticeHours?: number = 2;

  @ApiPropertyOptional({ enum: PaymentMode, default: PaymentMode.PRESENTIAL })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode = PaymentMode.PRESENTIAL;

  @ApiPropertyOptional({
    example: 'admin@lasrozas.local',
    description: 'Email del usuario que asumirá el rol OWNER del club',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email del propietario inicial debe ser válido' })
  ownerEmail?: string;
}
