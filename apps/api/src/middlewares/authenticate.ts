import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/error';
import { verifyToken } from '../lib/jwt';
import { cookieService } from '../services/cookie.service';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

type Handler<TReq extends Request = Request, TRes = any> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => TRes | Promise<TRes>;

/*
 * @description Wrapper to authenticate the user by verifying the token
 * @param handler - The handler function to be called after authentication
 * @returns The handler function with the authenticated request
 */
export function authenticate(handler: Handler<AuthenticatedRequest>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log('[authenticate] Checking for token');
    try {
      const token = cookieService.getTokenCookie({ req }); // HttpOnly: true on the cookie ensures JS cannot access it from within your frontend (e.g. no `document.cookie` access). XSS is not a concern here  .

      if (!token || typeof token !== 'string') {
        throw new AppError({
          code: 'UNAUTHORIZED',
          message: 'No token provided. Please login again.',
        });
      }

      console.log('[authenticate] Token found, verifying...');
      const resToken = await verifyToken(token);

      if (resToken.is_expired) {
        throw new AppError({
          code: 'FORBIDDEN',
          message: 'Token expired. Please login again.',
        });
      }

      console.log('[authenticate] Token verified, assigning to request');
      const authedReq = Object.assign(req, {
        userId: resToken.userId,
      }) as AuthenticatedRequest;

      console.log('[authenticate] Calling handler');
      return handler(authedReq, res, next);
    } catch (error) {
      next(error);
    }
  };
}
