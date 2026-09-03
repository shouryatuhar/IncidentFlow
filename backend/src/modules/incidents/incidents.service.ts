import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import {
  CreateIncidentInput,
  UpdateIncidentInput,
  QueryIncidentsInput,
} from './incidents.validation';
import { IncidentStatus, Prisma } from '@prisma/client';

export class IncidentsService {
  static async list(query: QueryIncidentsInput) {
    const { search, severity, status, serviceId, sortBy, sortOrder, page, limit } = query;

    const where: Prisma.IncidentWhereInput = {};

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, incidents] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.findMany({
        where,
        include: {
          service: {
            select: { id: true, name: true, status: true },
          },
          reporter: {
            select: { id: true, name: true, email: true },
          },
          assignee: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { comments: true, timeline: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return {
      incidents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        service: true,
        reporter: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        timeline: {
          include: {
            actor: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!incident) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }

    return incident;
  }

  static async create(input: CreateIncidentInput, reporterId: string) {
    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
    });

    if (!service) {
      throw new NotFoundError(`Service with ID ${input.serviceId} not found`);
    }

    let assigneeName: string | null = null;
    if (input.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: input.assigneeId },
      });
      if (assignee) {
        assigneeName = assignee.name;
      }
    }

    const incident = await prisma.incident.create({
      data: {
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: IncidentStatus.INVESTIGATING,
        serviceId: input.serviceId,
        reporterId,
        assigneeId: input.assigneeId,
      },
      include: {
        service: true,
        reporter: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Record initial timeline events
    await prisma.timelineEvent.create({
      data: {
        incidentId: incident.id,
        actorId: reporterId,
        type: 'CREATED',
        message: `Incident created with severity ${input.severity}`,
      },
    });

    if (assigneeName) {
      await prisma.timelineEvent.create({
        data: {
          incidentId: incident.id,
          actorId: reporterId,
          type: 'ASSIGNED',
          message: `Assigned to ${assigneeName}`,
        },
      });
    }

    return incident;
  }

  static async update(id: string, input: UpdateIncidentInput, actorId: string) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        assignee: true,
      },
    });

    if (!incident) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }

    const timelineEventsToCreate: Array<{
      type: string;
      message: string;
    }> = [];

    const updateData: Prisma.IncidentUpdateInput = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;

    if (input.serviceId !== undefined && input.serviceId !== incident.serviceId) {
      const newService = await prisma.service.findUnique({ where: { id: input.serviceId } });
      if (newService) {
        updateData.service = { connect: { id: newService.id } };
        timelineEventsToCreate.push({
          type: 'SERVICE_CHANGED',
          message: `Affected service moved to ${newService.name}`,
        });
      }
    }

    // Check severity changes
    if (input.severity !== undefined && input.severity !== incident.severity) {
      updateData.severity = input.severity;
      timelineEventsToCreate.push({
        type: 'SEVERITY_CHANGED',
        message: `Severity changed from ${incident.severity} to ${input.severity}`,
      });
    }

    // Check status changes
    if (input.status !== undefined && input.status !== incident.status) {
      updateData.status = input.status;
      if (input.status === IncidentStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
        timelineEventsToCreate.push({
          type: 'RESOLVED',
          message: `Incident resolved`,
        });
      } else {
        if (incident.status === IncidentStatus.RESOLVED) {
          updateData.resolvedAt = null;
        }
        timelineEventsToCreate.push({
          type: 'STATUS_CHANGED',
          message: `Status changed from ${incident.status} to ${input.status}`,
        });
      }
    }

    // Check assignee changes
    if (input.assigneeId !== undefined && input.assigneeId !== incident.assigneeId) {
      if (input.assigneeId === null) {
        updateData.assignee = { disconnect: true };
        timelineEventsToCreate.push({
          type: 'UNASSIGNED',
          message: `Incident unassigned`,
        });
      } else {
        const newAssignee = await prisma.user.findUnique({
          where: { id: input.assigneeId },
        });
        if (newAssignee) {
          updateData.assignee = { connect: { id: newAssignee.id } };
          timelineEventsToCreate.push({
            type: 'ASSIGNED',
            message: `Assigned to ${newAssignee.name}`,
          });
        }
      }
    }

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        reporter: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create any recorded timeline events
    for (const evt of timelineEventsToCreate) {
      await prisma.timelineEvent.create({
        data: {
          incidentId: id,
          actorId,
          type: evt.type,
          message: evt.message,
        },
      });
    }

    return updatedIncident;
  }

  static async delete(id: string) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }

    return prisma.incident.delete({
      where: { id },
    });
  }
}
