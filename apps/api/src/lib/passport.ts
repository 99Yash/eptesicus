import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../env';
import { oauthService } from '../services/oauth.service';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('[Passport] Google OAuth callback received:', {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
        });

        const user = await oauthService.findOrCreateUser({
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails || [],
          photos: profile.photos,
        });
        return done(null, user);
      } catch (error) {
        console.error('[Passport] Error in Google OAuth callback:', error);
        return done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    // We'll implement this later if needed for session-based auth
    // For now, we're using JWT tokens, so this might not be necessary
    done(null, { id });
  } catch (error) {
    done(error);
  }
});

export default passport;
