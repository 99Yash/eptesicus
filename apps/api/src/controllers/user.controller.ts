import { User, UserInsertType } from '@workspace/db/helpers';
import { NextFunction, Request, Response } from 'express';
import { generateEncryptedToken } from '../lib/jwt';
import { cookieService } from '../services/cookie.service';
import { userService } from '../services/user.service';

class UserController {
  async upsertUser(
    req: Request<object, object, UserInsertType>,
    res: Response<{ user: User }>,
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

      const { token } = await generateEncryptedToken({ uid: user.id });

      cookieService.setTokenCookie({ res, token });

      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(
    req: Request<object, object, object, { id: string }>,
    res: Response<{ user: User }>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.getUser(req.query.id);

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
