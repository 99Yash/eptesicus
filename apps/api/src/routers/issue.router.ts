import { issueCreateSchema, issueUpdateSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import { issueController } from '../controllers/issue.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

export const issues: Router = Router({ mergeParams: true });

// Create
issues.post(
  '/',
  validate(issueCreateSchema, authenticate(issueController.createIssue))
);

// List
issues.get('/', authenticate(issueController.listIssues));

// Read
issues.get('/:id', authenticate(issueController.getIssue));

// Update
issues.put(
  '/:id',
  validate(issueUpdateSchema, authenticate(issueController.updateIssue))
);

// Delete
issues.delete('/:id', authenticate(issueController.deleteIssue));
