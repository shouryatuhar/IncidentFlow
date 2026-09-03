import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ENV } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle unexpected errors
  console.error('Unhandled server error:', err);

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
