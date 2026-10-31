import { Request, Response, NextFunction } from 'express';
import { WebhooksService } from './webhooks.service';
import { webhookIncidentSchema } from './webhooks.validation';

export class WebhooksController {
  static async handleIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const secretHeader =
        req.headers['x-webhook-secret'] ||
        (req.headers.authorization?.startsWith('Bearer ')
          ? req.headers.authorization.split(' ')[1]
          : undefined);

      WebhooksService.verifySecret(secretHeader as string);

      const eventId = req.get('Idempotency-Key') || req.get('x-event-id') || req.body.eventId;
      const input = webhookIncidentSchema.parse({ ...req.body, eventId });
      const result = await WebhooksService.handleIncomingIncident(input);

      res.status(result.duplicate ? 200 : 201).json({
        success: true,
        data: result.incident,
        meta: { duplicate: result.duplicate },
      });
    } catch (error) {
      next(error);
    }
  }
}
