import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import {
  ActivityLogItemDto,
  ActivityLogsPaginatedResponseDto,
} from './dto/activity-log-response.dto';
import { CreateActivityLogParams } from './dto/create-activity-log.dto';
import { QueryActivityLogsDto } from './dto/query-activity-logs.dto';

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un evento de actividad en el sistema de manera asíncrona y resiliente.
   * Si ocurre un error durante la persistencia, se registra en el Logger sin abortar el flujo.
   */
  async log(params: CreateActivityLogParams): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          clubId: params.clubId || null,
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          summary: params.summary,
          metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error al persistir log de auditoría (${params.action} - ${params.entityType}): ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Consulta paginada y filtrada de logs de auditoría de un club (para administradores).
   */
  async findClubLogs(
    clubId: string,
    query: QueryActivityLogsDto,
  ): Promise<ActivityLogsPaginatedResponseDto> {
    const where: Prisma.ActivityLogWhereInput = {
      clubId,
      ...this.buildCommonFilters(query),
    };

    return this.paginateLogs(where, query);
  }

  /**
   * Consulta paginada de actividades propias de un usuario autenticado ("Mi Actividad").
   */
  async findUserLogs(
    userId: string,
    clubId: string | null,
    query: QueryActivityLogsDto,
  ): Promise<ActivityLogsPaginatedResponseDto> {
    const where: Prisma.ActivityLogWhereInput = {
      userId,
      ...(clubId ? { clubId } : {}),
      ...this.buildCommonFilters(query),
    };

    return this.paginateLogs(where, query);
  }

  /**
   * Consulta global de logs para SuperAdmin transversal a todos los clubes.
   */
  async findSuperAdminLogs(
    query: QueryActivityLogsDto,
  ): Promise<ActivityLogsPaginatedResponseDto> {
    const where: Prisma.ActivityLogWhereInput = {
      ...this.buildCommonFilters(query),
    };

    return this.paginateLogs(where, query);
  }

  private buildCommonFilters(query: QueryActivityLogsDto): Prisma.ActivityLogWhereInput {
    const filters: Prisma.ActivityLogWhereInput = {};

    if (query.action) {
      filters.action = query.action;
    }

    if (query.entityType) {
      filters.entityType = {
        equals: query.entityType,
        mode: 'insensitive',
      };
    }

    if (query.userId) {
      filters.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      filters.createdAt = {};
      if (query.startDate) {
        filters.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filters.createdAt.lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      filters.summary = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    return filters;
  }

  private async paginateLogs(
    where: Prisma.ActivityLogWhereInput,
    query: QueryActivityLogsDto,
  ): Promise<ActivityLogsPaginatedResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    const data: ActivityLogItemDto[] = records.map((r) => ({
      id: r.id,
      clubId: r.clubId,
      userId: r.userId,
      user: r.user
        ? {
            id: r.user.id,
            fullName: `${r.user.firstName} ${r.user.lastName}`.trim(),
            email: r.user.email,
            avatarUrl: r.user.avatarUrl,
          }
        : null,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      summary: r.summary,
      metadata: (r.metadata as Record<string, any>) || null,
      ipAddress: r.ipAddress,
      userAgent: r.userAgent,
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
