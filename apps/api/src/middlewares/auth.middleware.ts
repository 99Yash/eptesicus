import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import { AppError } from '../lib/error';
import { verifyToken } from '../lib/jwt';
import { cookieService } from '../services/cookie.service';

/*
 * @description Authenticate the user by verifying the token
 * @param req - The request object
 * @param _res - The response object
 * @param next - The next function
 */
export const authenticate: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = cookieService.getTokenCookie({ req }); // HttpOnly: true on the cookie ensures JS cannot access it from within your frontend (e.g. no document.cookie access). XSS is not a concern here.

    if (!token || typeof token !== 'string') {
      throw new AppError({
        code: 'UNAUTHORIZED',
        message: 'No token provided. Please login again.',
      });
    }

    const res = await verifyToken(token);

    if (res.is_expired) {
      throw new AppError({
        code: 'FORBIDDEN',
        message: 'Token expired. Please login again.',
      });
    }

    req.body.user = {
      id: res.uid,
    };

    next();
  } catch (error) {
    next(error);
  }
};
