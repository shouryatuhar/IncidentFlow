import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/overview', authenticate, AnalyticsController.getOverview);
router.get('/incidents', authenticate, AnalyticsController.getIncidents);

export default router;
