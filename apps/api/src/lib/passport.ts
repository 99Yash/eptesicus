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
      callbackURL: '/api/auth/google/callback',
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

      const user = await userService.upsertUser({
        email: profile.emails[0].value,
        name: profile.displayName,
        username: profile.username,
        image_url: profile.photos?.[0]?.value,
      });
    }
  )
);
