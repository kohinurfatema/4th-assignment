import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { registerUser, loginUser, getMe, updateProfile } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth.middleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password || !role) {
      throw new AppError('name, email, password, and role are required', 400);
    }
    if (!['TENANT', 'LANDLORD'].includes(role)) {
      throw new AppError('Role must be TENANT or LANDLORD', 400);
    }

    const user = await registerUser(name, email, password, role as Role);
    sendSuccess(res, 201, 'Registration successful', user);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new AppError('email and password are required', 400);
    }

    const data = await loginUser(email, password);
    sendSuccess(res, 200, 'Login successful', data);
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { name, phone, address } = req.body as {
      name?: string;
      phone?: string;
      address?: string;
    };

    const user = await updateProfile(userId, { name, phone, address });
    sendSuccess(res, 200, 'Profile updated successfully', user);
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await getMe(userId);
    sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (err) {
    next(err);
  }
};
