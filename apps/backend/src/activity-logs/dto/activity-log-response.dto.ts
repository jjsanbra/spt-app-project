import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityAction } from '@prisma/client';

export class ActivityLogUserSummaryDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: string;

  @ApiProperty({ description: 'Nombre completo del usuario' })
  fullName: string;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiPropertyOptional({ description: 'Avatar del usuario', nullable: true })
  avatarUrl?: string | null;
}

export class ActivityLogItemDto {
  @ApiProperty({ description: 'ID único del registro de auditoría' })
  id: string;

  @ApiPropertyOptional({ description: 'ID del club asociado', type: String, nullable: true })
  clubId?: string | null;

  @ApiPropertyOptional({ description: 'ID del usuario que ejecutó la acción', type: String, nullable: true })
  userId?: string | null;

  @ApiPropertyOptional({ description: 'Detalle del usuario ejecutor', type: ActivityLogUserSummaryDto, nullable: true })
  user?: ActivityLogUserSummaryDto | null;

  @ApiProperty({ enum: ActivityAction, description: 'Tipo de acción ejecutada' })
  action: ActivityAction;

  @ApiProperty({ description: 'Tipo de entidad afectada' })
  entityType: string;

  @ApiPropertyOptional({ description: 'ID del recurso afectado', type: String, nullable: true })
  entityId?: string | null;

  @ApiProperty({ description: 'Resumen amigable de la acción' })
  summary: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales y diferencias en formato JSON', nullable: true })
  metadata?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Dirección IP de origen', type: String, nullable: true })
  ipAddress?: string | null;

  @ApiPropertyOptional({ description: 'Navegador o User-Agent del cliente', type: String, nullable: true })
  userAgent?: string | null;

  @ApiProperty({ description: 'Fecha y hora de creación' })
  createdAt: string;
}

export class ActivityLogsPaginatedResponseDto {
  @ApiProperty({ type: [ActivityLogItemDto], description: 'Lista de eventos de auditoría' })
  data: ActivityLogItemDto[];

  @ApiProperty({ description: 'Total de registros que coinciden con los filtros' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Registros por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas disponibles' })
  totalPages: number;
}
