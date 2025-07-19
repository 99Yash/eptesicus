import { User, UserInsert } from '@workspace/db/helpers';
import { NextFunction, Request, Response } from 'express';
import userService from '../services/user.service';

class UserController {
  async createUser(
    req: Request<object, object, UserInsert>,
    res: Response<{ user: User }>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, name, username, bio, image_url } = req.body;

      const user = await userService.createUser({
        email,
        name,
        username,
        bio,
        image_url,
      });

      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
