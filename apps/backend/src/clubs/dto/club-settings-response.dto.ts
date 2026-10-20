import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';

export class ClubSettingsResponseDto {
  @ApiProperty({ example: '888e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Club Pádel Pro Madrid' })
  name: string;

  @ApiProperty({ example: 'padel-pro-madrid' })
  slug: string;

  @ApiPropertyOptional({ example: 'Centro deportivo de alto rendimiento', nullable: true })
  description?: string | null;

  @ApiProperty({ example: 'info@padelpromadrid.es' })
  email: string;

  @ApiPropertyOptional({ example: '+34910000000', nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'Calle de los Deportes 12', nullable: true })
  address?: string | null;

  @ApiPropertyOptional({ example: 'Madrid', nullable: true })
  city?: string | null;

  @ApiPropertyOptional({ example: '28001', nullable: true })
  postalCode?: string | null;

  @ApiProperty({ example: 8, description: 'Hora de apertura (0 a 23)' })
  openingHour: number;

  @ApiProperty({ example: 23, description: 'Hora de cierre (1 a 24)' })
  closingHour: number;

  @ApiProperty({ example: 60, description: 'Duración por defecto de franjas en minutos' })
  slotDurationMinutes: number;

  @ApiProperty({ example: 2, description: 'Horas mínimas de antelación para partidas abiertas' })
  openGameMinNoticeHours: number;

  @ApiProperty({ enum: PaymentMode, example: PaymentMode.PRESENTIAL })
  paymentMode: PaymentMode;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  updatedAt: Date;
}
