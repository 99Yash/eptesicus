import { signupSchema, verifyEmailSchema } from '@workspace/db/helpers';
import { Router } from 'express';
import passport from 'passport';
import z from 'zod';
import { authController } from '../controllers/auth.controller';
import { env } from '../env';
import { AppError } from '../lib/error';
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
// On success, Passport will attach the User object returned from the strategy to `user` in the callback.
auth.get('/google/callback', (req, res, next) => {
  const buildHtml = (payload: Record<string, unknown>) => {
    return `<!DOCTYPE html>
    <html><head><title>Google OAuth</title></head><body>
    <script>
      (function () {
        const payload = ${JSON.stringify({ type: 'google-oauth', ...payload })};
        if (window.opener) {
          window.opener.postMessage(payload, '${env.WEB_APP_URL ?? 'http://localhost:3000'}');
          window.close();
        } else {
          // Fallback for users who opened in same tab
          window.location.href = '${env.WEB_APP_URL ?? 'http://localhost:3000'}';
        }
      })();
    </script></body></html>`;
  };

  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) {
      console.error('[auth.router] Google OAuth error:', err);

      if (err instanceof AppError) {
        return res
          .status(200)
          .send(buildHtml({ error: err.code, message: err.message }));
      }

      return res
        .status(200)
        .send(
          buildHtml({ error: 'GOOGLE_OAUTH', message: 'Google OAuth failed' })
        );
    }

    console.log('[auth.router] Google OAuth callback for user:', user);

    const { success, data } = z
      .object({
        id: z.string(),
        __wasCreated: z.boolean().optional(),
      })
      .safeParse(user);

    if (!success) {
      return res
        .status(200)
        .send(
          buildHtml({ error: 'GOOGLE_OAUTH', message: 'Google OAuth failed' })
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

    // Send success payload via postMessage HTML, include first-time marker
    return res
      .status(200)
      .send(buildHtml({ ok: true, wasCreated: !!data.__wasCreated }));
  })(req, res, next);
});

auth.get(
  '/github',
  passport.authenticate('github', {
    session: false,
    scope: ['user:email'],
  })
);

// 2. GitHub OAuth callback
auth.get('/github/callback', (req, res, next) => {
  const buildHtml = (payload: Record<string, unknown>) => {
    return `<!DOCTYPE html>
    <html><head><title>GitHub OAuth</title></head><body>
    <script>
      (function () {
        const payload = ${JSON.stringify({ type: 'github-oauth', ...payload })};
        if (window.opener) {
          window.opener.postMessage(payload, '${env.WEB_APP_URL ?? 'http://localhost:3000'}');
          window.close();
        } else {
          // Fallback for users who opened in same tab
          window.location.href = '${env.WEB_APP_URL ?? 'http://localhost:3000'}';
        }
      })();
    </script></body></html>`;
  };

  passport.authenticate(
    'github',
    { session: false },
    async (err: any, user: any) => {
      if (err) {
        console.error('[auth.router] GitHub OAuth error:', err);

        if (err instanceof AppError) {
          return res
            .status(200)
            .send(buildHtml({ error: err.code, message: err.message }));
        }

        return res
          .status(200)
          .send(
            buildHtml({ error: 'GITHUB_OAUTH', message: 'GitHub OAuth failed' })
          );
      }

      console.log('[auth.router] GitHub OAuth callback for user:', user);

      const { success, data } = z
        .object({
          id: z.string(),
          __wasCreated: z.boolean().optional(),
        })
        .safeParse(user);

      if (!success) {
        return res
          .status(200)
          .send(
            buildHtml({ error: 'GITHUB_OAUTH', message: 'GitHub OAuth failed' })
          );
      }

      console.log('[auth.router] GitHub OAuth successful for user:', data.id);

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

      // Send success payload via postMessage HTML
      return res
        .status(200)
        .send(buildHtml({ ok: true, wasCreated: !!data.__wasCreated }));
    }
  )(req, res, next);
});
