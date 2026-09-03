import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import { CreateCommentInput } from './comments.validation';

export class CommentsService {
  static async listByIncidentId(incidentId: string) {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundError(`Incident with ID ${incidentId} not found`);
    }

    return prisma.incidentComment.findMany({
      where: { incidentId },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async create(incidentId: string, authorId: string, input: CreateCommentInput) {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundError(`Incident with ID ${incidentId} not found`);
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    const comment = await prisma.incidentComment.create({
      data: {
        incidentId,
        authorId,
        content: input.content,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Automatically create a timeline event
    await prisma.timelineEvent.create({
      data: {
        incidentId,
        actorId: authorId,
        type: 'COMMENT_ADDED',
        message: `Comment added by ${author?.name || 'team member'}`,
      },
    });

    return comment;
  }
}
