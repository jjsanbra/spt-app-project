import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';

export class SuperAdminClubResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Club Deportivo Las Rozas' })
  name: string;

  @ApiProperty({ example: 'las-rozas-padel' })
  slug: string;

  @ApiPropertyOptional({ example: 'Centro deportivo moderno' })
  description?: string;

  @ApiProperty({ example: 'info@lasrozas.local' })
  email: string;

  @ApiPropertyOptional({ example: '+34910000002' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Avenida del Deporte, 10' })
  address?: string;

  @ApiPropertyOptional({ example: 'Las Rozas' })
  city?: string;

  @ApiPropertyOptional({ example: '28230' })
  postalCode?: string;

  @ApiProperty({ example: 8 })
  openingHour: number;

  @ApiProperty({ example: 23 })
  closingHour: number;

  @ApiProperty({ example: 60 })
  slotDurationMinutes: number;

  @ApiProperty({ example: 2 })
  openGameMinNoticeHours: number;

  @ApiProperty({ enum: PaymentMode, example: PaymentMode.PRESENTIAL })
  paymentMode: PaymentMode;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 6, description: 'Número total de instalaciones o pistas del club' })
  facilitiesCount: number;

  @ApiProperty({ example: 45, description: 'Número total de socios vinculados al club' })
  membersCount: number;

  @ApiProperty({ example: '2026-10-20T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-20T12:00:00.000Z' })
  updatedAt: Date;
}

export class SuperAdminClubListResponseDto {
  @ApiProperty({ type: [SuperAdminClubResponseDto] })
  items: SuperAdminClubResponseDto[];

  @ApiProperty({ example: 5, description: 'Total de clubes devueltos' })
  total: number;
}
