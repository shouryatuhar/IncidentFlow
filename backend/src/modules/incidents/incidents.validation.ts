import { z } from 'zod';
import { Severity, IncidentStatus } from '@prisma/client';

export const createIncidentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  severity: z.nativeEnum(Severity),
  serviceId: z.string().uuid('Valid serviceId is required'),
  assigneeId: z.string().uuid().nullable().optional(),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(5, 'Description must be at least 5 characters').optional(),
  severity: z.nativeEnum(Severity).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  serviceId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

export const queryIncidentsSchema = z.object({
  search: z.string().optional(),
  severity: z.nativeEnum(Severity).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  serviceId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'severity', 'status', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type QueryIncidentsInput = z.infer<typeof queryIncidentsSchema>;
