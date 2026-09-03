import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  static async getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await AnalyticsService.getOverview();
      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIncidents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await AnalyticsService.getIncidentAnalytics();
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
