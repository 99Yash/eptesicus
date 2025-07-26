import { signupSchema, verifyEmailSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { limiter } from '../lib/rate-limit';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

export const users: Router = Router({ mergeParams: true });

users.post(
  '/signup',
  limiter,
  validate(signupSchema, userController.upsertUser)
);

users.post(
  '/verify-email',
  validate(verifyEmailSchema, userController.verifyEmail)
);

users.get('/', authenticate(userController.getCurrentUser));

users.post('/signout', authenticate(userController.signout));
