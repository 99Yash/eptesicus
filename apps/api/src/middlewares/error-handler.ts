import { ErrorRequestHandler } from 'express';
import { AppError } from '../lib/error';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res
      .status(err.getStatusFromCode())
      .json({ code: err.code, message: err.message });
    return;
  }

  console.error('[UnhandledError]', err);
  res
    .status(500)
    .json({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' });
};
