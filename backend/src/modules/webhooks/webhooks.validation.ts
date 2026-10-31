import { z } from 'zod';
import { Severity } from '@prisma/client';

export const webhookIncidentSchema = z.object({
  eventId: z.string().min(1).max(200).optional(),
  service: z.string().min(1, 'Service name or ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters').max(10000),
  severity: z.nativeEnum(Severity),
});

export type WebhookIncidentInput = z.infer<typeof webhookIncidentSchema>;
