import { z } from 'zod';
import { Severity } from '@prisma/client';

export const demoAlertSchema = z.object({
  idempotencyKey: z.string().trim().min(1).max(150),
  service: z.string().trim().min(1).max(160),
  severity: z.nativeEnum(Severity),
});

export type DemoAlertInput = z.infer<typeof demoAlertSchema>;
