import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

/*
 * @description Validate the request body against a Zod schema
 * @param schema - The Zod schema to validate against
 * @returns A middleware function that validates the request body
 */
export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
