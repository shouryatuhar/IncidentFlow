import { Router } from 'express';
import { WebhooksController } from './webhooks.controller';
import { validate } from '../../middleware/validate';
import { webhookIncidentSchema } from './webhooks.validation';

const router = Router();

router.post(
  '/incidents',
  validate({ body: webhookIncidentSchema }),
  WebhooksController.handleIncident
);

export default router;
