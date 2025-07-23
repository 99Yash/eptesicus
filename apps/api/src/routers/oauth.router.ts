import { Router } from 'express';
import passport from 'passport';
import { oauthController } from '../controllers/oauth.controller';

const router: Router = Router();

// Initiate Google OAuth flow
router.get(
  '/google',
  oauthController.initiateGoogleAuth.bind(oauthController),
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: false, // We're using JWT tokens, not sessions
  }),
  oauthController.handleGoogleCallback.bind(oauthController)
);

// OAuth failure handler
router.get(
  '/failure',
  oauthController.handleOAuthFailure.bind(oauthController)
);

export { router as oauth };
