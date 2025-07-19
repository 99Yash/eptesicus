import { userInsertSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

export const userRouter: Router = Router({ mergeParams: true });

userRouter.post('/', validate(userInsertSchema), userController.upsertUser);

userRouter.get('/', authenticate, userController.getCurrentUser);
