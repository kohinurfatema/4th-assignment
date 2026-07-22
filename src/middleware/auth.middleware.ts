import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: Role };
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) return next(new AppError('No token provided', 401));

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new AppError('Server configuration error', 500));

  try {
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: Role };
    (req as AuthRequest).user = decoded;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};
