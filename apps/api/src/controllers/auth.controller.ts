import { signupSchema, verifyEmailSchema } from '@workspace/db/helpers';
import { NextFunction, Response } from 'express';
import { AppError } from '../lib/error';
import { generateEncryptedToken } from '../lib/jwt';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { ValidatedRequest } from '../middlewares/validate';
import { cookieService } from '../services/cookie.service';
import { userService } from '../services/user.service';

class AuthController {
  /*
   * Email-based signup. Sends a verification code via email.
   * – If the email already exists, we treat this as a resend and return 200.
   * – Otherwise we create the user and return 201.
   */
  async login(
    req: ValidatedRequest<typeof signupSchema>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, name, username, image_url, bio } = req.body;
      console.log('[AuthController] login received:', req.body);

      // Check if the email is already registered (regardless of method)
      let existingUser = null;
      try {
        existingUser = await userService.getUserByEmail(email);
      } catch (err) {
        if (
          !(err instanceof AppError) ||
          (err instanceof AppError && err.code !== 'NOT_FOUND')
        ) {
          // Unexpected error
          throw err;
        }
      }

      await userService.upsertUser({
        email,
        name: name ?? '',
        username,
        auth_provider: 'EMAIL',
        image_url,
        bio,
      });

      const status = existingUser ? 200 : 201;
      const message = existingUser ? 'User already exists' : 'User created';

      res.status(status).json({ message });
    } catch (error) {
      console.error('[AuthController] Error in signup:', error);
      next(error);
    }
  }

  /*
   * Verify email using the 8-digit code.
   */
  async verifyEmail(
    req: ValidatedRequest<typeof verifyEmailSchema>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, code } = req.body;
      console.log('[AuthController] verifyEmail for', email);

      const user = await userService.verifyEmail({ email, code });
      const { token } = await generateEncryptedToken({ userId: user.id });

      cookieService.setTokenCookie({ res, token });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /*
   * Sign out – clears JWT cookie.
   */
  async signout(
    _req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    cookieService.clearTokenCookie({ res });
    res.status(204).end();
  }
}

export const authController = new AuthController();
