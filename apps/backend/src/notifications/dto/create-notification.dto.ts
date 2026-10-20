import { NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  clubId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any> | null;
  sendEmail?: boolean;
  userEmail?: string;
}
