import { RentalStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

const rentalInclude = {
  tenant: { select: { id: true, name: true, email: true } },
  property: { select: { id: true, title: true, location: true, pricePerMonth: true } },
  payment: true,
};

export const submitRentalRequest = async (
  tenantId: string,
  propertyId: string,
  moveInDate: string,
  message?: string
) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);
  if (property.status !== 'AVAILABLE') throw new AppError('Property is not available', 400);

  const existing = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId, status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] } },
  });
  if (existing) throw new AppError('You already have an active request for this property', 400);

  return prisma.rentalRequest.create({
    data: { tenantId, propertyId, moveInDate: new Date(moveInDate), message },
    include: rentalInclude,
  });
};

export const getTenantRentals = async (tenantId: string) => {
  return prisma.rentalRequest.findMany({
    where: { tenantId },
    include: rentalInclude,
    orderBy: { createdAt: 'desc' },
  });
};

export const getRentalById = async (id: string, userId: string) => {
  const rental = await prisma.rentalRequest.findUnique({ where: { id }, include: rentalInclude });
  if (!rental) throw new AppError('Rental request not found', 404);

  const isOwner = rental.tenantId === userId || rental.property.id === userId;
  const property = await prisma.property.findUnique({ where: { id: rental.propertyId } });
  const isLandlord = property?.landlordId === userId;

  if (!isOwner && !isLandlord) throw new AppError('Forbidden', 403);
  return rental;
};

export const getLandlordRentals = async (landlordId: string) => {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    select: { id: true },
  });
  const propertyIds = properties.map((p) => p.id);

  return prisma.rentalRequest.findMany({
    where: { propertyId: { in: propertyIds } },
    include: rentalInclude,
    orderBy: { createdAt: 'desc' },
  });
};

export const completeRental = async (id: string, landlordId: string) => {
  const rental = await prisma.rentalRequest.findUnique({ where: { id }, include: { property: true } });
  if (!rental) throw new AppError('Rental request not found', 404);
  if (rental.property.landlordId !== landlordId) throw new AppError('Forbidden', 403);
  if (rental.status !== RentalStatus.ACTIVE) throw new AppError('Only active rentals can be marked as completed', 400);

  return prisma.rentalRequest.update({
    where: { id },
    data: { status: RentalStatus.COMPLETED },
    include: rentalInclude,
  });
};

export const updateRentalStatus = async (
  id: string,
  landlordId: string,
  status: 'APPROVED' | 'REJECTED'
) => {
  const rental = await prisma.rentalRequest.findUnique({ where: { id }, include: { property: true } });
  if (!rental) throw new AppError('Rental request not found', 404);
  if (rental.property.landlordId !== landlordId) throw new AppError('Forbidden', 403);
  if (rental.status !== RentalStatus.PENDING) throw new AppError('Only pending requests can be updated', 400);

  return prisma.rentalRequest.update({
    where: { id },
    data: { status },
    include: rentalInclude,
  });
};
