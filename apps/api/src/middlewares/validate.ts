import { NextFunction, Request, Response } from 'express';
import z from 'zod/v4';
import { AppError } from '../lib/error';

type Handler<TReq extends Request = Request, TRes = any> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => TRes | Promise<TRes>;

export type ValidatedRequest<Schema extends z.ZodTypeAny> = Request<
  any,
  any,
  z.infer<Schema>
>;

export function validate<
  Schema extends z.ZodTypeAny,
  TReq extends Request = Request,
>(
  schema: Schema,
  handler: Handler<TReq>
): (req: TReq, res: Response, next: NextFunction) => Promise<void>;
export function validate<Schema extends z.ZodTypeAny>(
  schema: Schema
): <TReq extends Request>(
  handler: Handler<TReq>
) => (req: TReq, res: Response, next: NextFunction) => Promise<void>;
export function validate<Schema extends z.ZodTypeAny>(
  schema: Schema,
  handler?: Handler<any>
) {
  const build = <TReq extends Request>(innerHandler: Handler<TReq>) => {
    return async (req: TReq, res: Response, next: NextFunction) => {
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
        // Cast is fine because we replace only the body, not the shape of req itself
        (req as unknown as Request).body = result.data;

        // Quick signal to confirm auth ran before validate when composed that way
        // (helps ensure 401s are returned before 400s in protected routes)
        console.log(
          '[validate] userId present?',
          (req as any).userId ? 'yes' : 'no'
        );

        console.log('[validate] Calling handler');

        await innerHandler(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  };

  if (handler) {
    return build(handler);
  }

  return <TReq extends Request>(inner: Handler<TReq>) => build(inner);
}
