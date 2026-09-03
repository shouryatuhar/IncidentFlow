import { Router } from 'express';
import { ServicesController } from './services.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import { validate } from '../../middleware/validate';
import { createServiceSchema, updateServiceSchema } from './services.validation';

const router = Router();

// Authenticated users can list and inspect services
router.get('/', authenticate, ServicesController.list);
router.get('/:id', authenticate, ServicesController.getById);

// Admin-only endpoints for mutation
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate({ body: createServiceSchema }),
  ServicesController.create
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate({ body: updateServiceSchema }),
  ServicesController.update
);

router.delete('/:id', authenticate, requireAdmin, ServicesController.delete);

export default router;
