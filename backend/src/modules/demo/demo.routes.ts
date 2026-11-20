import { NextFunction, Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../../config/prisma';
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

const capStormSize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const expiredBefore = new Date(now.getTime() - STORM_WINDOW_MS);
    await prisma.demoStormBucket.deleteMany({ where: { windowStartedAt: { lte: expiredBefore } } });

    const [bucket] = await prisma.$queryRaw<Array<{ count: number }>>`
      INSERT INTO "demo_storm_buckets" ("userId", "idempotencyKey", "windowStartedAt", "count")
      VALUES (${req.user!.id}, ${req.body.idempotencyKey}, ${now}, 1)
      ON CONFLICT ("userId", "idempotencyKey") DO UPDATE SET
        "windowStartedAt" = CASE
          WHEN "demo_storm_buckets"."windowStartedAt" <= ${expiredBefore} THEN ${now}
          ELSE "demo_storm_buckets"."windowStartedAt"
        END,
        "count" = CASE
          WHEN "demo_storm_buckets"."windowStartedAt" <= ${expiredBefore} THEN 1
          ELSE "demo_storm_buckets"."count" + 1
        END
      RETURNING "count"
    `;

    if (bucket.count > MAX_STORM_REQUESTS) {
      res.status(429).json({ success: false, error: { message: 'Demo retry storm limit is 50 requests per key per minute.' } });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.use(authenticate, requireDemoAccount, demoLimiter);
router.post('/alert', validate({ body: demoAlertSchema }), capStormSize, DemoController.alert);
router.post('/reset', DemoController.reset);

export default router;
