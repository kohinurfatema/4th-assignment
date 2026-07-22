import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errorDetails?: unknown
) => {
  res.status(statusCode).json({ success: false, message, errorDetails });
};
