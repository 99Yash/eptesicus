import { organizationInsertSchema } from '@workspace/db/schemas';
import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

export const organizations: Router = Router({ mergeParams: true });

// List organizations for current user
organizations.get('/', authenticate(organizationController.listOrganizations));

// Create organization
organizations.post(
  '/',
  authenticate(
    validate(organizationInsertSchema)(
      organizationController.createOrganization
    )
  )
);
