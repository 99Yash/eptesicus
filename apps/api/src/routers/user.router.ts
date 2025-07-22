import { signupSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

export const userRouter: Router = Router({ mergeParams: true });

userRouter.post('/', validate(signupSchema, userController.upsertUser));

userRouter.get('/', authenticate(userController.getCurrentUser));

userRouter.post('/signout', authenticate(userController.signout));
