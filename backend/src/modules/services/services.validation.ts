import { z } from 'zod';
import { ServiceStatus } from '@prisma/client';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  status: z.nativeEnum(ServiceStatus).optional().default(ServiceStatus.OPERATIONAL),
  ownerId: z.string().uuid().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().min(5, 'Description must be at least 5 characters').optional(),
  status: z.nativeEnum(ServiceStatus).optional(),
  ownerId: z.string().uuid().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
