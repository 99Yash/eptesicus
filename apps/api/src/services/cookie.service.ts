import { type CookieOptions, type Request, type Response } from 'express';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;

class CookieService {
  options: CookieOptions = {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: ONE_DAY,
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
    console.log('[CookieService] Setting token cookie:', { token });
    res.cookie(this.cookie_keys.token, token, this.options);
  }

  /*
   * @description Get the token cookie from the request object
   * @param req - The request object
   * @returns `req.cookies.token`
   */
  getTokenCookie({ req }: { req: Request }) {
    return req.cookies.token;
  }

  /*
   * @description Clear the token cookie from the response object
   * @param res - The response object
   */
  clearTokenCookie({ res }: { res: Response }) {
    console.log('[CookieService] Clearing token cookie');
    res.clearCookie(this.cookie_keys.token, this.options);
  }
}

export const cookieService = new CookieService();
