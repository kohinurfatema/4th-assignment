import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

export const createCategory = async (name: string) => {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) throw new AppError('Category already exists', 400);
  return prisma.category.create({ data: { name } });
};

export const updateCategory = async (id: string, name: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError('Category not found', 404);
  return prisma.category.update({ where: { id }, data: { name } });
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError('Category not found', 404);
  await prisma.category.delete({ where: { id } });
};
