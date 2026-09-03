import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';
import { WebhookIncidentInput } from './webhooks.validation';
import { IncidentStatus } from '@prisma/client';

export class WebhooksService {
  static verifySecret(headerSecret?: string | string[]): void {
    const secret = Array.isArray(headerSecret) ? headerSecret[0] : headerSecret;

    if (!secret || secret !== ENV.WEBHOOK_SECRET) {
      throw new UnauthorizedError('Invalid or missing webhook secret');
    }
  }

  static async handleIncomingIncident(input: WebhookIncidentInput) {
    // Locate service by exact ID or case-insensitive Name
    let service = await prisma.service.findFirst({
      where: {
        OR: [
          { id: input.service },
          { name: { equals: input.service, mode: 'insensitive' } },
        ],
      },
      include: {
        owner: true,
      },
    });

    if (!service) {
      throw new NotFoundError(
        `Service "${input.service}" not found. Ensure the service name matches an existing service.`
      );
    }

    // Determine reporter: use service owner or first system admin
    let reporterId = service.ownerId;
    if (!reporterId) {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) {
        reporterId = admin.id;
      } else {
        const anyUser = await prisma.user.findFirst();
        reporterId = anyUser!.id;
      }
    }

    // Create the incident
    const incident = await prisma.incident.create({
      data: {
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: IncidentStatus.INVESTIGATING,
        serviceId: service.id,
        reporterId,
        assigneeId: service.ownerId, // Auto-assign to service owner
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

    // Create initial timeline event
    await prisma.timelineEvent.create({
      data: {
        incidentId: incident.id,
        actorId: reporterId,
        type: 'CREATED',
        message: `Incident automatically created via external webhook with severity ${input.severity}`,
      },
    });

    if (service.owner) {
      await prisma.timelineEvent.create({
        data: {
          incidentId: incident.id,
          actorId: reporterId,
          type: 'ASSIGNED',
          message: `Auto-assigned to service owner: ${service.owner.name}`,
        },
      });
    }

    return incident;
  }
}
