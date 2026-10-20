import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateClubSettingsDto {
  @ApiPropertyOptional({ example: 'Club Pádel Pro Madrid' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 'El mejor club de pádel' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'contacto@club.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El formato de email no es válido' })
  email?: string;

  @ApiPropertyOptional({ example: '+34910000000' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'Calle Mayor 10' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Madrid' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: '28001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 8, description: 'Hora de apertura (0 a 23)' })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'La hora de apertura no puede ser menor a 0' })
  @Max(23, { message: 'La hora de apertura no puede ser mayor a 23' })
  openingHour?: number;

  @ApiPropertyOptional({ example: 23, description: 'Hora de cierre (1 a 24)' })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'La hora de cierre no puede ser menor a 1' })
  @Max(24, { message: 'La hora de cierre no puede ser mayor a 24' })
  closingHour?: number;

  @ApiPropertyOptional({ example: 60, description: 'Duración por defecto de franjas' })
  @IsOptional()
  @IsInt()
  @IsIn([30, 60, 90, 120], { message: 'La duración debe ser 30, 60, 90 o 120 minutos' })
  slotDurationMinutes?: number;

  @ApiPropertyOptional({ example: 2, description: 'Antelación mínima para partidas abiertas (horas)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  openGameMinNoticeHours?: number;

  @ApiPropertyOptional({ enum: PaymentMode, example: PaymentMode.PRESENTIAL })
  @IsOptional()
  @IsEnum(PaymentMode, { message: 'Modo de pago no válido' })
  paymentMode?: PaymentMode;
}
