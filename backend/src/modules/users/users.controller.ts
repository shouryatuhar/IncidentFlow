import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  static async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UsersService.list();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}
