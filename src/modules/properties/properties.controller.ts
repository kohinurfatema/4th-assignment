import { Request, Response, NextFunction } from 'express';
import { PropertyStatus } from '@prisma/client';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getLandlordProperties,
} from './properties.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth.middleware';

export const listProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, minPrice, maxPrice, categoryId, bedrooms } = req.query as Record<string, string>;
    const properties = await getProperties({
      location,
      categoryId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
    });
    sendSuccess(res, 200, 'Properties fetched successfully', properties);
  } catch (err) {
    next(err);
  }
};

export const getProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await getPropertyById(req.params['id'] as string);
    sendSuccess(res, 200, 'Property fetched successfully', property);
  } catch (err) {
    next(err);
  }
};

export const addProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = (req as AuthRequest).user?.id;
    if (!landlordId) throw new AppError('Unauthorized', 401);

    const { title, description, location, pricePerMonth, bedrooms, bathrooms, amenities, images, categoryId } =
      req.body as {
        title?: string;
        description?: string;
        location?: string;
        pricePerMonth?: number;
        bedrooms?: number;
        bathrooms?: number;
        amenities?: string[];
        images?: string[];
        categoryId?: string;
      };

    if (!title || !description || !location || !pricePerMonth || !bedrooms || !bathrooms || !categoryId) {
      throw new AppError('title, description, location, pricePerMonth, bedrooms, bathrooms, and categoryId are required', 400);
    }

    const property = await createProperty(landlordId, {
      title,
      description,
      location,
      pricePerMonth: Number(pricePerMonth),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      amenities: amenities ?? [],
      images: images ?? [],
      categoryId,
    });
    sendSuccess(res, 201, 'Property created successfully', property);
  } catch (err) {
    next(err);
  }
};

export const editProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = (req as AuthRequest).user?.id;
    if (!landlordId) throw new AppError('Unauthorized', 401);

    const id = req.params['id'] as string;
    const body = req.body as Partial<{
      title: string;
      description: string;
      location: string;
      pricePerMonth: number;
      bedrooms: number;
      bathrooms: number;
      amenities: string[];
      images: string[];
      categoryId: string;
      status: PropertyStatus;
    }>;

    const property = await updateProperty(id, landlordId, body);
    sendSuccess(res, 200, 'Property updated successfully', property);
  } catch (err) {
    next(err);
  }
};

export const removeProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = (req as AuthRequest).user?.id;
    if (!landlordId) throw new AppError('Unauthorized', 401);

    await deleteProperty(req.params['id'] as string, landlordId);
    sendSuccess(res, 200, 'Property deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

export const myProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = (req as AuthRequest).user?.id;
    if (!landlordId) throw new AppError('Unauthorized', 401);

    const properties = await getLandlordProperties(landlordId);
    sendSuccess(res, 200, 'Properties fetched successfully', properties);
  } catch (err) {
    next(err);
  }
};
