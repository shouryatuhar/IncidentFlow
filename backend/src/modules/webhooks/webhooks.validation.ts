import { z } from 'zod';
import { Severity } from '@prisma/client';

export const webhookIncidentSchema = z.object({
  service: z.string().min(1, 'Service name or ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  severity: z.nativeEnum(Severity),
});

export type WebhookIncidentInput = z.infer<typeof webhookIncidentSchema>;
