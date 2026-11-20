import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middleware/auth';
import { requireDemoAccount } from '../../middleware/demoAccount';
import { validate } from '../../middleware/validate';
import { DemoController } from './demo.controller';
import { demoAlertSchema } from './demo.validation';

const router = Router();
const demoLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? 'unauthenticated',
  message: { success: false, error: { message: 'Demo Lab rate limit exceeded.' } },
});

router.use(authenticate, requireDemoAccount, demoLimiter);
router.post('/alert', validate({ body: demoAlertSchema }), DemoController.alert);
router.post('/reset', DemoController.reset);

export default router;
