import { ApiProperty } from '@nestjs/swagger';

export class SuperadminOverviewResponseDto {
  @ApiProperty({ description: 'Total de clubes registrados en la plataforma', example: 12 })
  totalClubs!: number;

  @ApiProperty({ description: 'Total de clubes activos actualmente', example: 10 })
  activeClubs!: number;

  @ApiProperty({ description: 'Total de usuarios registrados en el sistema', example: 840 })
  totalUsers!: number;

  @ApiProperty({ description: 'Volumen bruto de reservas procesadas (GMV) este mes en euros', example: 28500.0 })
  monthlyGmv!: number;

  @ApiProperty({ description: 'Porcentaje de crecimiento de GMV respecto al mes anterior', example: 8.5 })
  gmvGrowthPercent!: number;
}

