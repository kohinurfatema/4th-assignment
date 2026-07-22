import { Request, Response, NextFunction } from 'express';
import { createReview, getPropertyReviews } from './reviews.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth.middleware';

export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as AuthRequest).user?.id;
    if (!tenantId) throw new AppError('Unauthorized', 401);

    const { propertyId, rating, comment } = req.body as {
      propertyId?: string;
      rating?: number;
      comment?: string;
    };

    if (!propertyId || rating === undefined || !comment) {
      throw new AppError('propertyId, rating, and comment are required', 400);
    }

    const review = await createReview(tenantId, propertyId, Number(rating), comment);
    sendSuccess(res, 201, 'Review submitted successfully', review);
  } catch (err) {
    next(err);
  }
};

export const propertyReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await getPropertyReviews(req.params['propertyId'] as string);
    sendSuccess(res, 200, 'Reviews fetched successfully', reviews);
  } catch (err) {
    next(err);
  }
};
