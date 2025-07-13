import { type CookieOptions, type Request, type Response } from 'express';
import { env } from '../env';

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;

class CookieService {
  options: CookieOptions = {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV !== 'development',
    sameSite: 'lax',
    maxAge: ONE_MONTH,
  };

  cookie_keys = {
    token: 'token',
  };

  setTokenCookie({ res, token }: { res: Response; token: string }) {
    res.cookie(this.cookie_keys.token, token, this.options);
  }

  getTokenCookie({ req }: { req: Request }) {
    return req.cookies.token;
  }

  clearTokenCookie({ res }: { res: Response }) {
    res.clearCookie(this.cookie_keys.token, this.options);
  }
}

export const cookie_service = new CookieService();
