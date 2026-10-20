import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourtType, SportType, SurfaceType } from '@prisma/client';

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  BLOCKED = 'BLOCKED',
}

export class TimeSlotAvailabilityDto {
  @ApiProperty({ example: '2026-10-25T09:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2026-10-25T10:30:00.000Z' })
  endTime: string;

  @ApiProperty({ example: '09:00' })
  startHourText: string;

  @ApiProperty({ example: '10:30' })
  endHourText: string;

  @ApiProperty({ enum: SlotStatus, example: SlotStatus.AVAILABLE })
  status: SlotStatus;

  @ApiProperty({ example: 16.0, description: 'Precio del slot según pricing rule aplicable' })
  price: number;

  @ApiProperty({ example: false, description: 'Indica si la franja es hora punta' })
  isPeakHour: boolean;

  @ApiProperty({ example: 2.0, description: 'Suplemento de iluminación si aplica' })
  lightSurcharge: number;

  @ApiPropertyOptional({ example: 'Mantenimiento de red', nullable: true })
  blockedReason?: string | null;
}

export class FacilityAvailabilityResponseDto {
  @ApiProperty({ example: 'fac-uuid-1' })
  facilityId: string;

  @ApiProperty({ example: 'Pista 1 - Cristal Central' })
  facilityName: string;

  @ApiProperty({ enum: SportType, example: SportType.PADEL })
  sportType: SportType;

  @ApiProperty({ enum: CourtType, example: CourtType.INDOOR })
  courtType: CourtType;

  @ApiProperty({ enum: SurfaceType, example: SurfaceType.CRYSTAL })
  surfaceType: SurfaceType;

  @ApiProperty({ example: true })
  hasLighting: boolean;

  @ApiProperty({ example: 90 })
  defaultSlotMinutes: number;

  @ApiProperty({ type: [TimeSlotAvailabilityDto] })
  slots: TimeSlotAvailabilityDto[];
}
