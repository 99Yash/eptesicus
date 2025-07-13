import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import { AppError } from '../lib/error';
import { verifyToken } from '../lib/jwt';
import { cookie_service } from '../services/cookie.service';

export const authenticate: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = cookie_service.getTokenCookie({ req });

    if (!token || typeof token !== 'string') {
      throw new AppError({
        code: 'UNAUTHORIZED',
        message: 'No token provided',
      });
    }

    const res = await verifyToken(token);
    if (res.is_expired) {
      throw new AppError({
        code: 'FORBIDDEN',
        message: 'Token expired',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
