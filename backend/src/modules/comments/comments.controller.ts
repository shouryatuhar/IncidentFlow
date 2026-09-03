import { Request, Response, NextFunction } from 'express';
import { CommentsService } from './comments.service';

export class CommentsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comments = await CommentsService.listByIncidentId(req.params.id);
      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await CommentsService.create(
        req.params.id,
        req.user!.id,
        req.body
      );
      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
}
