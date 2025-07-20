import { userInsertSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { withAuth } from '../middlewares/auth';
import { withValidation } from '../middlewares/validate';

export const userRouter: Router = Router({ mergeParams: true });

userRouter.post(
  '/',
  withValidation(userInsertSchema, userController.upsertUser)
);

userRouter.get('/', withAuth(userController.getCurrentUser));
