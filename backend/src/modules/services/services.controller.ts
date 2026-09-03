import { Request, Response, NextFunction } from 'express';
import { ServicesService } from './services.service';

export class ServicesController {
  static async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await ServicesService.list();
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await ServicesService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await ServicesService.create(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await ServicesService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ServicesService.delete(req.params.id);
      res.status(200).json({
        success: true,
        data: { message: 'Service successfully deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
}
