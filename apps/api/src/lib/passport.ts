import passport, { Profile } from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from 'passport-google-oauth20';
import { env } from '../env';
import { userService } from '../services/user.service';
import { AppError } from './error';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);

        if (!profile.emails || !profile.emails[0]?.value) {
          throw new AppError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No email found',
          });
        }

        const username =
          // Some Google accounts expose a username field in the profile json, but most do not.
          // Fallback to the local-part of the email (before the @) when username is absent.
          profile.username ?? profile.emails[0].value.split('@')[0];

        const result = await userService.upsertUser({
          email: profile.emails[0].value,
          name: profile.displayName,
          username,
          image_url: profile.photos?.[0]?.value,
          sendVerificationEmail: false,
          auth_provider: 'GOOGLE',
        });

        // Complete the Passport flow. Attach marker for first-time creation.
        return done(null, { ...result.user, __wasCreated: result.wasCreated });
      } catch (error) {
        // Forward any errors (e.g., email exists with different provider) to Passport
        return done(error as Error, undefined);
      }
    }
  )
);

// ---------------- GitHub Strategy ----------------

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        console.log('[passport] GitHub profile:', profile);

        // GitHub may not always return primary email in profile.emails by default.
        const email = profile.emails?.[0]?.value;

        if (!email) {
          throw new AppError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No email found in GitHub profile',
          });
        }

        const username = profile.username ?? email.split('@')[0];

        const result = await userService.upsertUser({
          email,
          name: profile.displayName ?? username,
          username,
          image_url: profile.photos?.[0]?.value,
          sendVerificationEmail: false,
          auth_provider: 'GITHUB',
        });

        return done(null, { ...result.user, __wasCreated: result.wasCreated });
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
