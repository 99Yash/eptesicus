import { organizationInsertSchema } from '@workspace/db/schemas';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { ValidatedRequest } from '../middlewares/validate';
import { organizationService } from '../services/organization.service';

class OrganizationController {
  async createOrganization(
    req: AuthenticatedRequest &
      ValidatedRequest<typeof organizationInsertSchema>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, logo_url, bio } = req.body;

      const org = await organizationService.createOrganization({
        name,
        logo_url,
        bio,
        user_id: req.userId,
      });

      res.status(201).json(org);
    } catch (error) {
      next(error);
    }
  }

  async listOrganizations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const organizations = await organizationService.listOrganizations(
        req.userId
      );
      res.status(200).json(organizations);
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
