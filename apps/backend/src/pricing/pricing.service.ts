import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityAction } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { PricingRuleResponseDto } from './dto/pricing-rule-response.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async findAll(clubId: string, facilityId?: string): Promise<PricingRuleResponseDto[]> {
    const rules = await this.prisma.pricingRule.findMany({
      where: {
        clubId,
        ...(facilityId && { facilityId }),
      },
      include: {
        facility: { select: { name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return rules.map((r) => this.mapPricingRule(r));
  }

  async findOne(clubId: string, id: string): Promise<PricingRuleResponseDto> {
    const rule = await this.prisma.pricingRule.findFirst({
      where: { id, clubId },
      include: {
        facility: { select: { name: true } },
      },
    });

    if (!rule) {
      throw new NotFoundException(`Regla de precio con ID "${id}" no encontrada`);
    }

    return this.mapPricingRule(rule);
  }

  async create(clubId: string, dto: CreatePricingRuleDto, userId?: string): Promise<PricingRuleResponseDto> {
    const rule = await this.prisma.pricingRule.create({
      data: {
        clubId,
        name: dto.name,
        facilityId: dto.facilityId,
        sportType: dto.sportType,
        isPeakHour: dto.isPeakHour ?? false,
        startTime: dto.startTime,
        endTime: dto.endTime,
        daysOfWeek: dto.daysOfWeek,
        memberPrice: dto.memberPrice,
        guestPrice: dto.guestPrice,
        lightSurcharge: dto.lightSurcharge ?? 0.0,
        priority: dto.priority ?? 1,
      },
      include: {
        facility: { select: { name: true } },
      },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.PRICING_RULE_CREATED,
      entityType: 'PricingRule',
      entityId: rule.id,
      summary: `Tarifa "${rule.name}" creada (Socio: ${rule.memberPrice}€ / No socio: ${rule.guestPrice}€)`,
      metadata: {
        name: rule.name,
        facilityId: rule.facilityId,
        memberPrice: Number(rule.memberPrice),
        guestPrice: Number(rule.guestPrice),
      },
    });

    return this.mapPricingRule(rule);
  }

  async update(
    clubId: string,
    id: string,
    dto: UpdatePricingRuleDto,
    userId?: string,
  ): Promise<PricingRuleResponseDto> {
    const existing = await this.findOne(clubId, id);

    const rule = await this.prisma.pricingRule.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.facilityId !== undefined && { facilityId: dto.facilityId }),
        ...(dto.sportType !== undefined && { sportType: dto.sportType }),
        ...(dto.isPeakHour !== undefined && { isPeakHour: dto.isPeakHour }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.daysOfWeek && { daysOfWeek: dto.daysOfWeek }),
        ...(dto.memberPrice !== undefined && { memberPrice: dto.memberPrice }),
        ...(dto.guestPrice !== undefined && { guestPrice: dto.guestPrice }),
        ...(dto.lightSurcharge !== undefined && { lightSurcharge: dto.lightSurcharge }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
      include: {
        facility: { select: { name: true } },
      },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.PRICING_RULE_UPDATED,
      entityType: 'PricingRule',
      entityId: rule.id,
      summary: `Tarifa "${rule.name}" actualizada`,
      metadata: {
        previous: {
          memberPrice: existing.memberPrice,
          guestPrice: existing.guestPrice,
        },
        new: { ...dto },
      },
    });

    return this.mapPricingRule(rule);
  }

  async remove(clubId: string, id: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.findOne(clubId, id);

    await this.prisma.pricingRule.delete({
      where: { id },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.PRICING_RULE_DELETED,
      entityType: 'PricingRule',
      entityId: id,
      summary: `Tarifa "${existing.name}" eliminada`,
    });

    return {
      success: true,
      message: 'Regla de tarificación eliminada correctamente',
    };
  }

  private mapPricingRule(rule: any): PricingRuleResponseDto {
    return {
      id: rule.id,
      clubId: rule.clubId,
      facilityId: rule.facilityId,
      facilityName: rule.facility?.name ?? null,
      sportType: rule.sportType,
      name: rule.name,
      isPeakHour: rule.isPeakHour,
      startTime: rule.startTime,
      endTime: rule.endTime,
      daysOfWeek: rule.daysOfWeek,
      memberPrice: Number(rule.memberPrice),
      guestPrice: Number(rule.guestPrice),
      lightSurcharge: Number(rule.lightSurcharge),
      priority: rule.priority,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
