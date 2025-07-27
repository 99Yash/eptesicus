import { Router } from 'express';
import passport from 'passport';
import { generateEncryptedToken } from '../lib/jwt';
import { cookieService } from '../services/cookie.service';

// Middlewares & validation
import { signupSchema, verifyEmailSchema } from '@workspace/db/helpers';
import { limiter } from '../lib/rate-limit';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

import { authController } from '../controllers/auth.controller';

export const auth: Router = Router({ mergeParams: true });

// ---------- Email / code based auth ----------

auth.post('/signup', limiter, validate(signupSchema, authController.signup));

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
    failureRedirect: `${process.env.WEB_APP_URL ?? 'http://localhost:3000'}/signin?error=google`,
  }),
  async (req, res) => {
    const user = req.user as { id: string } | undefined;

    if (!user) {
      return res.redirect(
        `${process.env.WEB_APP_URL ?? 'http://localhost:3000'}/signin?error=google`
      );
    }

    console.log('[auth.router] Google OAuth successful for user:', user.id);

    const { token } = await generateEncryptedToken({ userId: user.id });
    console.log(
      '[auth.router] Generated token:',
      token.substring(0, 15),
      '...'
    );

    cookieService.setTokenCookie({ res, token });
    console.log('[auth.router] Token cookie set');

    // Redirect the user back to the frontend. Feel free to change the path as needed.
    return res.redirect(process.env.WEB_APP_URL ?? 'http://localhost:3000');
  }
);
