import { Router } from 'express';
import { IncidentsController } from './incidents.controller';
import { CommentsController } from '../comments/comments.controller';
import { TimelineController } from '../timeline/timeline.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import { validate } from '../../middleware/validate';
import {
  createIncidentSchema,
  updateIncidentSchema,
  queryIncidentsSchema,
} from './incidents.validation';
import { createCommentSchema } from '../comments/comments.validation';

const router = Router();

// Incidents CRUD
router.get(
  '/',
  authenticate,
  validate({ query: queryIncidentsSchema }),
  IncidentsController.list
);

router.get('/:id', authenticate, IncidentsController.getById);

router.post(
  '/',
  authenticate,
  validate({ body: createIncidentSchema }),
  IncidentsController.create
);

router.patch(
  '/:id',
  authenticate,
  validate({ body: updateIncidentSchema }),
  IncidentsController.update
);

router.delete('/:id', authenticate, requireAdmin, IncidentsController.delete);

// Incident Comments
router.get('/:id/comments', authenticate, CommentsController.list);
router.post(
  '/:id/comments',
  authenticate,
  validate({ body: createCommentSchema }),
  CommentsController.create
);

// Incident Timeline
router.get('/:id/timeline', authenticate, TimelineController.list);

export default router;
