import { Request, Response, NextFunction } from 'express';
import { IncidentsService } from './incidents.service';

export class IncidentsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await IncidentsService.list(req.query as any);
      res.status(200).json({
        success: true,
        data: {
          incidents: result.incidents,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await IncidentsService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await IncidentsService.create(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await IncidentsService.update(req.params.id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await IncidentsService.delete(req.params.id);
      res.status(200).json({
        success: true,
        data: { message: 'Incident successfully deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
}
