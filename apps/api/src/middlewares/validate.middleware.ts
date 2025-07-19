import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../lib/error';

/*
 * @description Validate the request body against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns A middleware function that validates the request body
 */
export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        console.error(errors.join(', '));

        throw new AppError({
          code: 'BAD_REQUEST',
          message: 'Invalid request body',
          cause: errors.map((error) => error.message).join(', '),
        });
      }

      req.body = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
