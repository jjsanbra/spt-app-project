import { ActivityAction } from '@prisma/client';

export interface CreateActivityLogParams {
  clubId?: string | null;
  userId?: string | null;
  action: ActivityAction;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
