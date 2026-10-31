import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';
import { WebhookIncidentInput } from './webhooks.validation';
import { IncidentStatus, Prisma } from '@prisma/client';
import { timingSafeEqual } from 'crypto';

export class WebhooksService {
  static verifySecret(headerSecret?: string | string[]): void {
    const secret = Array.isArray(headerSecret) ? headerSecret[0] : headerSecret;

    const expected = ENV.WEBHOOK_SECRET;
    const isWeakDemoSecret = Boolean(expected && /supersecret|change.?me|replace.?with/i.test(expected));
    if (!expected || expected.length < 32 || isWeakDemoSecret) {
      throw new UnauthorizedError('Webhook ingress is not configured with a strong secret');
    }

    const providedBuffer = secret ? Buffer.from(secret) : Buffer.alloc(0);
    const expectedBuffer = Buffer.from(expected);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedError('Invalid or missing webhook secret');
    }
  }

  static async handleIncomingIncident(input: WebhookIncidentInput) {
    if (input.eventId) {
      const existingIncident = await prisma.incident.findUnique({
        where: { sourceEventId: input.eventId },
        include: {
          service: true,
          reporter: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
      if (existingIncident) return { incident: existingIncident, duplicate: true };
    }

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
        if (!anyUser) throw new NotFoundError('Cannot create webhook incidents until at least one user exists');
        reporterId = anyUser.id;
      }
    }

    try {
      const incident = await prisma.$transaction(async (tx) => {
        const created = await tx.incident.create({
          data: {
            title: input.title,
            description: input.description,
            severity: input.severity,
            status: IncidentStatus.INVESTIGATING,
            serviceId: service.id,
            reporterId,
            assigneeId: service.ownerId,
            sourceEventId: input.eventId,
          },
          include: {
            service: true,
            reporter: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } },
          },
        });

        await tx.timelineEvent.create({
          data: {
            incidentId: created.id,
            actorId: reporterId,
            type: 'CREATED',
            message: `Incident automatically created via external webhook with severity ${input.severity}`,
          },
        });

        if (service.owner) {
          await tx.timelineEvent.create({
            data: {
              incidentId: created.id,
              actorId: reporterId,
              type: 'ASSIGNED',
              message: `Auto-assigned to service owner: ${service.owner.name}`,
            },
          });
        }
        return created;
      });

      return { incident, duplicate: false };
    } catch (error) {
      // Concurrent provider retries can both pass the initial lookup; the unique
      // constraint makes one winner and this returns its persisted result.
      if (input.eventId && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existingIncident = await prisma.incident.findUnique({
          where: { sourceEventId: input.eventId },
          include: {
            service: true,
            reporter: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } },
          },
        });
        if (existingIncident) return { incident: existingIncident, duplicate: true };
      }
      throw error;
    }
  }
}
