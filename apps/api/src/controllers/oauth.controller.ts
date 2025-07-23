import { NextFunction, Response } from 'express';
import { generateEncryptedToken } from '../lib/jwt';
import { cookieService } from '../services/cookie.service';

class OAuthController {
  // Initiate Google OAuth flow
  async initiateGoogleAuth(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log('[OAuthController] Initiating Google OAuth flow');
      // This will be handled by Passport middleware
      next();
    } catch (error) {
      next(error);
    }
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log('[OAuthController] Handling Google OAuth callback');

      // Passport middleware will populate req.user
      const user = req.user;

      if (!user) {
        throw new Error('No user found after OAuth authentication');
      }

      console.log('[OAuthController] User authenticated via Google:', user.id);

      // Generate JWT token
      const { token } = await generateEncryptedToken({ userId: user.id });

      // Set token cookie
      cookieService.setTokenCookie({ res, token });

      // Redirect to frontend with success
      const frontendUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://yourdomain.com'
          : 'http://localhost:3000';

      res.redirect(`${frontendUrl}/auth/success`);
    } catch (error) {
      console.error('[OAuthController] Error in Google callback:', error);

      // Redirect to frontend with error
      const frontendUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://yourdomain.com'
          : 'http://localhost:3000';

      res.redirect(
        `${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`
      );
    }
  }

  // Handle OAuth failure
  async handleOAuthFailure(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log('[OAuthController] OAuth authentication failed');

      const frontendUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://yourdomain.com'
          : 'http://localhost:3000';

      res.redirect(
        `${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`
      );
    } catch (error) {
      next(error);
    }
  }
}

export const oauthController = new OAuthController();
