import { updateUsernameSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

export const users: Router = Router({ mergeParams: true });

users.get('/', authenticate(userController.getCurrentUser));

users.get(
  '/check-username/:username',
  userController.checkUsernameAvailability
);

users.put(
  '/username',
  validate(updateUsernameSchema, authenticate(userController.updateUsername))
);
