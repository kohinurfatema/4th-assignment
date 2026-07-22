import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const createReview = async (
  tenantId: string,
  propertyId: string,
  rating: number,
  comment: string
) => {
  const completedRental = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId, status: 'COMPLETED' },
  });
  if (!completedRental) {
    throw new AppError('You can only review a property after completing a rental', 403);
  }

  const existing = await prisma.review.findFirst({ where: { tenantId, propertyId } });
  if (existing) throw new AppError('You have already reviewed this property', 400);

  if (rating < 1 || rating > 5) throw new AppError('Rating must be between 1 and 5', 400);

  return prisma.review.create({
    data: { tenantId, propertyId, rating, comment },
    include: {
      tenant: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } },
    },
  });
};

export const getPropertyReviews = async (propertyId: string) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  return prisma.review.findMany({
    where: { propertyId },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
};
