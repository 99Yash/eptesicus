import { NextFunction, Request, Response } from 'express';
import z, { AnyZodObject } from 'zod';
import { AppError } from '../lib/error';

type Handler<TReq = any, TRes = any> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => TRes | Promise<TRes>;

export type ValidatedRequest<Schema extends z.AnyZodObject> = Request<
  any,
  any,
  z.infer<Schema>
>;

export function withValidation<Schema extends AnyZodObject>(
  schema: Schema,
  handler: Handler<Request>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Invalid request body',
          cause: errors.map((e) => `${e.path}: ${e.message}`).join(', '),
        });
      }

      // Optionally: override req.body with parsed data (fully typed)
      req.body = result.data;

      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
