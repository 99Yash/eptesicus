import { userInsertSchema } from '@workspace/db/helpers';
import { NextFunction, Response } from 'express';
import { generateEncryptedToken } from '../lib/jwt';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ValidatedRequest } from '../middlewares/validate';
import { cookieService } from '../services/cookie.service';
import { userService } from '../services/user.service';

class UserController {
  async upsertUser(
    req: ValidatedRequest<typeof userInsertSchema>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, name, username, bio, image_url } = req.body;

      const user = await userService.upsertUser({
        email,
        name,
        username,
        bio,
        image_url,
      });

      // The token is generated from the user's id AFTER the user is created. This will be used to authenticate the user on subsequent requests.
      // This has to be done after the user verifies their email address.
      const { token } = await generateEncryptedToken({ user_id: user.id });

      cookieService.setTokenCookie({ res, token });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.getUser(req.userId);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
