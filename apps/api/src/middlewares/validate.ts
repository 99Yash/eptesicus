import { NextFunction, Request, Response } from 'express';
import z from 'zod/v4';
import { AppError } from '../lib/error';

type Handler<TReq = any, TRes = any> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => TRes | Promise<TRes>;

export type ValidatedRequest<Schema extends z.ZodTypeAny> = Request<
  any,
  any,
  z.infer<Schema>
>;

export function validate<Schema extends z.ZodTypeAny>(
  schema: Schema,
  handler: Handler<Request>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('[validate] Validating request body');
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        console.log('[validate] Errors:', errors);

        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Invalid request body',
          cause: errors.map((e) => `${e.path}: ${e.message}`).join(', '),
        });
      }

      console.log('[validate] Request body validated');

      // Optionally: override req.body with parsed data (fully typed)
      req.body = result.data;

      console.log('[validate] Calling handler');

      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
