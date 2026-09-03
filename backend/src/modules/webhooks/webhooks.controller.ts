import { Request, Response, NextFunction } from 'express';
import { WebhooksService } from './webhooks.service';

export class WebhooksController {
  static async handleIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const secretHeader =
        req.headers['x-webhook-secret'] ||
        (req.headers.authorization?.startsWith('Bearer ')
          ? req.headers.authorization.split(' ')[1]
          : undefined);

      WebhooksService.verifySecret(secretHeader as string);

      const incident = await WebhooksService.handleIncomingIncident(req.body);

      res.status(201).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }
}
