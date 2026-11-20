import { NextFunction, Request, Response, Router } from 'express';
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

const STORM_WINDOW_MS = 60 * 1000;
const MAX_STORM_REQUESTS = 50;
const stormRequests = new Map<string, { count: number; expiresAt: number }>();

const capStormSize = (req: Request, res: Response, next: NextFunction): void => {
  const now = Date.now();
  for (const [key, bucket] of stormRequests) {
    if (bucket.expiresAt <= now) stormRequests.delete(key);
  }

  const bucketKey = `${req.user!.id}:${req.body.idempotencyKey}`;
  const bucket = stormRequests.get(bucketKey);
  if (bucket && bucket.expiresAt > now && bucket.count >= MAX_STORM_REQUESTS) {
    res.status(429).json({ success: false, error: { message: 'Demo retry storm limit is 50 requests per key per minute.' } });
    return;
  }

  stormRequests.set(bucketKey, {
    count: bucket && bucket.expiresAt > now ? bucket.count + 1 : 1,
    expiresAt: bucket && bucket.expiresAt > now ? bucket.expiresAt : now + STORM_WINDOW_MS,
  });
  next();
};

router.use(authenticate, requireDemoAccount, demoLimiter);
router.post('/alert', validate({ body: demoAlertSchema }), capStormSize, DemoController.alert);
router.post('/reset', DemoController.reset);

export default router;
