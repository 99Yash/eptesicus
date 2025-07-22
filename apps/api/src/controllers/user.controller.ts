import { userInsertSchema } from '@workspace/db/helpers';
import { NextFunction, Response } from 'express';
import { generateEncryptedToken } from '../lib/jwt';
import { AuthenticatedRequest } from '../middlewares/authenticate';
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
      const { email, name, username } = req.body;
      console.log('[UserController] Received payload:', req.body);
      const user = await userService.upsertUser({
        email,
        name,
        username,
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
      console.log(
        '[UserController] getCurrentUser called with userId:',
        req.userId
      );
      const user = await userService.getUser(req.userId);
      console.log('[UserController] getCurrentUser found user:', user);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async signout(
    _req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    cookieService.clearTokenCookie({ res });
    console.log('[UserController] Token cookie cleared');

    res.status(204).end();
  }
}

export const userController = new UserController();
