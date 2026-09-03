import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { CreateServiceInput, UpdateServiceInput } from './services.validation';
import { IncidentStatus } from '@prisma/client';

export class ServicesService {
  static async list() {
    const services = await prisma.service.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        incidents: {
          select: { id: true, status: true, severity: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return services.map((svc) => {
      const activeIncidents = svc.incidents.filter(
        (inc) => inc.status !== IncidentStatus.RESOLVED
      );
      return {
        ...svc,
        totalIncidents: svc.incidents.length,
        activeIncidentsCount: activeIncidents.length,
      };
    });
  }

  static async getById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        incidents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!service) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }

    return service;
  }

  static async create(input: CreateServiceInput, defaultOwnerId: string) {
    const existing = await prisma.service.findUnique({
      where: { name: input.name },
    });

    if (existing) {
      throw new ConflictError(`A service named "${input.name}" already exists`);
    }

    const ownerId = input.ownerId || defaultOwnerId;

    return prisma.service.create({
      data: {
        name: input.name,
        description: input.description,
        status: input.status,
        ownerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async update(id: string, input: UpdateServiceInput) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }

    if (input.name && input.name !== service.name) {
      const existing = await prisma.service.findUnique({
        where: { name: input.name },
      });
      if (existing) {
        throw new ConflictError(`A service named "${input.name}" already exists`);
      }
    }

    return prisma.service.update({
      where: { id },
      data: input,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async delete(id: string) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }

    return prisma.service.delete({
      where: { id },
    });
  }
}
