import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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

      const user = await userService.upsertUser({
        email: profile.emails[0].value,
        name: profile.displayName,
        username,
        image_url: profile.photos?.[0]?.value,
        sendVerificationEmail: false,
      });

      // Complete the Passport flow. We don’t use sessions, so the user is just attached to req.user
      return done(null, user);
    }
  )
);
