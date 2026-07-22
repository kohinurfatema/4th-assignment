import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from './auth.middleware';
import { AppError } from '../utils/AppError';

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
};
