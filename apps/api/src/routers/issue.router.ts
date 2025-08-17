import { issueCreateSchema, issueUpdateSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import z from 'zod/v4';
import { issueController } from '../controllers/issue.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

export const issues: Router = Router({ mergeParams: true });

export const issueParamsSchema = z.object({
  id: z.string(),
});

// Create
issues.post(
  '/',
  authenticate(validate(issueCreateSchema)(issueController.createIssue))
);

// List
issues.get('/', authenticate(issueController.listIssues));

// Read
issues.get(
  '/:id',
  authenticate(validate(issueParamsSchema)(issueController.getIssue))
);

// Update
issues.patch(
  '/:id',
  authenticate(validate(issueUpdateSchema)(issueController.updateIssue))
);

// Delete
issues.delete('/:id', authenticate(issueController.deleteIssue));
