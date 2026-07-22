import { PropertyStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

interface CreatePropertyInput {
  title: string;
  description: string;
  location: string;
  pricePerMonth: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  categoryId: string;
}

interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  bedrooms?: number;
}

export const getProperties = async (filters: PropertyFilters) => {
  return prisma.property.findMany({
    where: {
      status: PropertyStatus.AVAILABLE,
      ...(filters.location && {
        location: { contains: filters.location, mode: 'insensitive' },
      }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
      ...((filters.minPrice || filters.maxPrice) && {
        pricePerMonth: {
          ...(filters.minPrice && { gte: filters.minPrice }),
          ...(filters.maxPrice && { lte: filters.maxPrice }),
        },
      }),
    },
    include: { category: true, landlord: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true } },
      reviews: { include: { tenant: { select: { id: true, name: true } } } },
    },
  });
  if (!property) throw new AppError('Property not found', 404);
  return property;
};

export const createProperty = async (landlordId: string, data: CreatePropertyInput) => {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new AppError('Category not found', 404);

  return prisma.property.create({
    data: { ...data, landlordId },
    include: { category: true },
  });
};

export const updateProperty = async (
  id: string,
  landlordId: string,
  data: Partial<CreatePropertyInput & { status: PropertyStatus }>
) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError('Property not found', 404);
  if (property.landlordId !== landlordId) throw new AppError('Forbidden', 403);

  return prisma.property.update({ where: { id }, data, include: { category: true } });
};

export const deleteProperty = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError('Property not found', 404);
  if (property.landlordId !== landlordId) throw new AppError('Forbidden', 403);

  await prisma.property.delete({ where: { id } });
};

export const getLandlordProperties = async (landlordId: string) => {
  return prisma.property.findMany({
    where: { landlordId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};
