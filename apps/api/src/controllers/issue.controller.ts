import {
  issueCreateSchema,
  IssueCreateType,
  issueUpdateSchema,
  IssueUpdateType,
} from '@workspace/db/helpers';
import { NextFunction, Response } from 'express';
import { AppError } from '../lib/error';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { ValidatedRequest } from '../middlewares/validate';
import { issueService } from '../services/issue.service';

class IssueController {
  /* Create a new issue */
  async createIssue(
    req: AuthenticatedRequest & ValidatedRequest<typeof issueCreateSchema>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body as IssueCreateType;

      const issue = await issueService.createIssue({
        ...body,
        user_id: req.userId,
      });

      res.status(201).json(issue);
    } catch (error) {
      next(error);
    }
  }

  /* Get a single issue */
  async getIssue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Issue id is required',
        });
      }

      const issue = await issueService.getIssue(id);

      res.status(200).json(issue);
    } catch (error) {
      next(error);
    }
  }

  /* List issues */
  async listIssues(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { organization_id } = req.query as {
        organization_id?: string;
      };

      const issues = await issueService.listIssues({
        organization_id,
        user_id: req.userId,
      });

      res.status(200).json(issues);
    } catch (error) {
      next(error);
    }
  }

  /* Update an issue */
  async updateIssue(
    req: AuthenticatedRequest & ValidatedRequest<typeof issueUpdateSchema>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Issue id is required',
        });
      }

      const body = req.body as IssueUpdateType;

      const issue = await issueService.updateIssue(id, body);

      res.status(200).json(issue);
    } catch (error) {
      next(error);
    }
  }

  /* Delete an issue */
  async deleteIssue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Issue id is required',
        });
      }

      await issueService.deleteIssue(id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export const issueController = new IssueController();
