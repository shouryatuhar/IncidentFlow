import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { WebhooksService } from '../webhooks/webhooks.service';
import { DemoAlertInput } from './demo.validation';

export class DemoController {
  static async alert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idempotencyKey, service, severity } = req.body as DemoAlertInput;
      const eventId = `demo:${req.user!.id}:${idempotencyKey}`;
      const result = await WebhooksService.handleIncomingIncident(
        {
          eventId,
          service,
          severity,
          title: `[Demo] ${service} alert`,
          description: `Simulated ${severity.replace('_', '-')} monitoring alert for ${service}.`,
        },
        { isDemo: true }
      );

      res.status(result.duplicate ? 200 : 201).json({
        incidentId: result.incident.id,
        duplicate: result.duplicate,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reset(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await prisma.incident.deleteMany({ where: { isDemo: true } });
      res.status(200).json({ deleted: result.count });
    } catch (error) {
      next(error);
    }
  }
}
