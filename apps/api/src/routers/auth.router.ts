import { signupSchema, verifyEmailSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import passport from 'passport';
import z from 'zod';
import { authController } from '../controllers/auth.controller';
import { env } from '../env';
import { generateEncryptedToken } from '../lib/jwt';
import { limiter } from '../lib/rate-limit';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { cookieService } from '../services/cookie.service';

export const auth: Router = Router({ mergeParams: true });

// ---------- Email / code based auth ----------

auth.post('/login', limiter, validate(signupSchema, authController.login));

auth.post(
  '/verify-email',
  validate(verifyEmailSchema, authController.verifyEmail)
);

auth.post('/signout', authenticate(authController.signout));

// 1. Kick-off Google OAuth
// NOTE: We do not maintain server-side sessions, hence `session: false`.
auth.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['email', 'profile'],
    prompt: 'select_account', // Always ask the user to choose account
  })
);

// 2. Google OAuth callback
// On success, Passport will attach the User object returned from the strategy to req.user.
auth.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.WEB_APP_URL ?? 'http://localhost:3000'}/signin?error=google`,
  }),
  async (req, res) => {
    const user = req.user;

    console.log('[auth.router] Google OAuth callback for user:', user);

    const { success, data } = z
      .object({
        id: z.string(),
      })
      .safeParse(user);

    if (!success) {
      return res.redirect(
        `${env.WEB_APP_URL ?? 'http://localhost:3000'}/signin?error=google`
      );
    }

    console.log('[auth.router] Google OAuth successful for user:', data.id);

    const { token } = await generateEncryptedToken({
      userId: data.id,
    });
    console.log(
      '[auth.router] Generated token:',
      token.substring(0, 15),
      '...'
    );

    cookieService.setTokenCookie({ res, token });
    console.log('[auth.router] Token cookie set');

    // Redirect the user back to the frontend. Feel free to change the path as needed.
    return res.redirect(env.WEB_APP_URL ?? 'http://localhost:3000');
  }
);
