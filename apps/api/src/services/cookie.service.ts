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

  /*
   * @description Set the token cookie in the response object
   * @param res - The response object
   * @param token - The token to set
   */
  setTokenCookie({ res, token }: { res: Response; token: string }) {
    res.cookie(this.cookie_keys.token, token, this.options);
  }

  /*
   * @description Get the token cookie from the request object
   * @param req - The request object
   * @returns The token cookie
   */
  getTokenCookie({ req }: { req: Request }) {
    return req.cookies.token;
  }

  /*
   * @description Clear the token cookie from the response object
   * @param res - The response object
   */
  clearTokenCookie({ res }: { res: Response }) {
    res.clearCookie(this.cookie_keys.token, this.options);
  }
}

export const cookieService = new CookieService();
