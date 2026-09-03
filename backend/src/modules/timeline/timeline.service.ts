import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';

export class TimelineService {
  static async listByIncidentId(incidentId: string) {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundError(`Incident with ID ${incidentId} not found`);
    }

    return prisma.timelineEvent.findMany({
      where: { incidentId },
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
