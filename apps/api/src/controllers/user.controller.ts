import { userInsertSchema, verifyEmailSchema } from '@workspace/db/helpers';
import { NextFunction, Response } from 'express';
import z from 'zod';
import { AppError } from '../lib/error';
import { generateEncryptedToken } from '../lib/jwt';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { ValidatedRequest } from '../middlewares/validate';
import { cookieService } from '../services/cookie.service';
import { userService } from '../services/user.service';

class UserController {
  async signup(
    req: ValidatedRequest<typeof userInsertSchema>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, name, username } = req.body;
      console.log('[UserController] Received payload:', req.body);
      await userService.upsertUser({
        email,
        name,
        username,
        sendVerificationEmail: true,
      });
      // The token is generated from the user's id AFTER the user is created. This will be used to authenticate the user on subsequent requests.
      // This has to be done after the user verifies their email address.

      res.status(201).json({
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('[UserController] Error in signup:', error);
      next(error);
    }
  }

  async verifyEmail(
    req: ValidatedRequest<typeof verifyEmailSchema>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, code } = req.body;
      const user = await userService.verifyEmail({ email, code });

      const { token } = await generateEncryptedToken({ userId: user.id });

      cookieService.setTokenCookie({ res, token });
      res.status(200).json(user);
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

  async checkUsernameAvailability(
    req: ValidatedRequest<never>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username } = req.params;
      const parsedUsername = z.string().safeParse(username);

      if (!parsedUsername.success) {
        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Invalid username',
        });
      }

      console.log('[UserController] Checking username availability:', username);

      const result = await userService.checkUsernameAvailability(username);

      res.status(200).json(result);
    } catch (error) {
      console.error(
        '[UserController] Error checking username availability:',
        error
      );
      next(error);
    }
  }

  async updateUsername(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = z.object({ username: z.string() }).safeParse(req.body);

      if (!parsed.success) {
        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Invalid username',
        });
      }

      const updatedUser = await userService.updateUsername(
        req.userId,
        parsed.data.username
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
