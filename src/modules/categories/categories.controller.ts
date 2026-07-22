import { Request, Response, NextFunction } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from './categories.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await getAllCategories();
    sendSuccess(res, 200, 'Categories fetched successfully', categories);
  } catch (err) {
    next(err);
  }
};

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name) throw new AppError('Category name is required', 400);

    const category = await createCategory(name);
    sendSuccess(res, 201, 'Category created successfully', category);
  } catch (err) {
    next(err);
  }
};

export const editCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { name } = req.body as { name?: string };
    if (!name) throw new AppError('Category name is required', 400);

    const category = await updateCategory(id, name);
    sendSuccess(res, 200, 'Category updated successfully', category);
  } catch (err) {
    next(err);
  }
};

export const removeCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    await deleteCategory(id);
    sendSuccess(res, 200, 'Category deleted successfully', null);
  } catch (err) {
    next(err);
  }
};
