import { prisma } from '../../config/prisma';

export class UsersService {
  static async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
