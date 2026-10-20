import { ApiProperty } from '@nestjs/swagger';
import { CourtType, SportType, SurfaceType } from '@prisma/client';

export class FacilityResponseDto {
  @ApiProperty({ example: 'ba916b62-92d3-4a9d-86df-87d547e457ea' })
  id: string;

  @ApiProperty({ example: 'ca816b62-92d3-4a9d-86df-87d547e457eb' })
  clubId: string;

  @ApiProperty({ example: 'Pista 1 - Pádel Cristal Indoor' })
  name: string;

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

  @ApiProperty({ example: 4 })
  minPlayers: number;

  @ApiProperty({ example: 4 })
  maxPlayers: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  updatedAt: Date;
}
