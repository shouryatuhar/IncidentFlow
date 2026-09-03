import { Request, Response, NextFunction } from 'express';
import { TimelineService } from './timeline.service';

export class TimelineController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await TimelineService.listByIncidentId(req.params.id);
      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }
}
