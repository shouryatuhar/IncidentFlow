import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

const DEMO_ACCOUNT_EMAILS = new Set([
  'admin@incidentflow.dev',
  'engineer@incidentflow.dev',
  'sre@incidentflow.dev',
  'devops@incidentflow.dev',
]);

export const requireDemoAccount = (req: Request, _res: Response, next: NextFunction): void => {
  const email = req.user?.email.toLowerCase();
  if (!email || !DEMO_ACCOUNT_EMAILS.has(email)) {
    return next(new ForbiddenError('Demo Lab is available only to seeded demo accounts'));
  }
  next();
};
