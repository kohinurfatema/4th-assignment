import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateUserStatus = async (id: string, isBanned: boolean) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot ban an admin', 403);

  return prisma.user.update({
    where: { id },
    data: { isBanned },
    select: { id: true, name: true, email: true, role: true, isBanned: true },
  });
};

export const getAllProperties = async () => {
  return prisma.property.findMany({
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true } },
      _count: { select: { rentalRequests: true, reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllRentals = async () => {
  return prisma.rentalRequest.findMany({
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, title: true, location: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};
