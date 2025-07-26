import z from 'zod';

export const unknownError = 'Something went wrong. Please try again.';
export function getErrorMessage(err: unknown) {
  if (typeof err === 'string') {
    return err;
  } else if (err instanceof z.ZodError) {
    return err.errors.map((e) => e.message).join(', ') ?? unknownError;
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}
