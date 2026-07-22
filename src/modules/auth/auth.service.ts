import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: Role
) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use', 400);

  if (role === Role.ADMIN) throw new AppError('Cannot register as admin', 403);

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid email or password', 401);
  if (user.isBanned) throw new AppError('Your account has been banned', 403);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid email or password', 401);

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('Server configuration error', 500);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string; address?: string }
) => {
  if (!data.name && !data.phone && !data.address) {
    throw new AppError('At least one field (name, phone, address) is required', 400);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      updatedAt: true,
    },
  });
};
