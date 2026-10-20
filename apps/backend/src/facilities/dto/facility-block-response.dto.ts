import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FacilityBlockResponseDto {
  @ApiProperty({ example: 'blk-916b62-92d3-4a9d-86df-87d547e457ea' })
  id: string;

  @ApiProperty({ example: 'ca816b62-92d3-4a9d-86df-87d547e457eb' })
  clubId: string;

  @ApiProperty({ example: 'fac-816b62-92d3-4a9d-86df-87d547e457ec' })
  facilityId: string;

  @ApiProperty({ example: 'Mantenimiento focos y red' })
  title: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Revisión técnica anual de iluminación',
  })
  reason?: string | null;

  @ApiProperty({ example: '2026-10-25T10:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-10-25T14:00:00.000Z' })
  endTime: Date;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  updatedAt: Date;
}
