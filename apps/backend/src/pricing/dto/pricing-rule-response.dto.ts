import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SportType } from '@prisma/client';

export class PricingRuleResponseDto {
  @ApiProperty({ example: 'rule-916b62-92d3-4a9d-86df-87d547e457ea' })
  id: string;

  @ApiProperty({ example: 'ca816b62-92d3-4a9d-86df-87d547e457eb' })
  clubId: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'fac-816b62-92d3-4a9d-86df-87d547e457ec',
  })
  facilityId?: string | null;

  @ApiPropertyOptional({ enum: SportType, example: SportType.PADEL, nullable: true })
  sportType?: SportType | null;

  @ApiProperty({ example: 'Tarifa Estándar Mañanas (Valle)' })
  name: string;

  @ApiProperty({ example: false })
  isPeakHour: boolean;

  @ApiPropertyOptional({ type: String, nullable: true, example: '08:00' })
  startTime?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '17:00' })
  endTime?: string | null;

  @ApiProperty({ type: [Number], example: [1, 2, 3, 4, 5] })
  daysOfWeek: number[];

  @ApiProperty({ example: 16.0 })
  memberPrice: number;

  @ApiProperty({ example: 24.0 })
  guestPrice: number;

  @ApiProperty({ example: 0.0 })
  lightSurcharge: number;

  @ApiProperty({ example: 1 })
  priority: number;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  updatedAt: Date;
}
