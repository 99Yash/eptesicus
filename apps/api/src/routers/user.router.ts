import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';

export const users: Router = Router({ mergeParams: true });

users.get('/', authenticate(userController.getCurrentUser));

users.get(
  '/check-username/:username',
  userController.checkUsernameAvailability
);

users.put('/username', authenticate(userController.updateUsername));
