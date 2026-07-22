import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorDetails: err.errorDetails ?? null,
    });
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorDetails: process.env.NODE_ENV === 'production' ? null : err.message,
  });
};

export default errorHandler;
