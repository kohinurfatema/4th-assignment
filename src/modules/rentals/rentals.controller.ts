import { Request, Response, NextFunction } from 'express';
import {
  submitRentalRequest,
  getTenantRentals,
  getRentalById,
  getLandlordRentals,
  updateRentalStatus,
  completeRental,
} from './rentals.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth.middleware';
import { isValidDate, isFutureDate } from '../../utils/validate';

export const submitRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as AuthRequest).user?.id;
    if (!tenantId) throw new AppError('Unauthorized', 401);

    const { propertyId, moveInDate, message } = req.body as {
      propertyId?: string;
      moveInDate?: string;
      message?: string;
    };

    if (!propertyId || !moveInDate) throw new AppError('propertyId and moveInDate are required', 400);
    if (!isValidDate(moveInDate)) throw new AppError('moveInDate must be a valid date (YYYY-MM-DD)', 400);
    if (!isFutureDate(moveInDate)) throw new AppError('moveInDate must be a future date', 400);

    const rental = await submitRentalRequest(tenantId, propertyId, moveInDate, message);
    sendSuccess(res, 201, 'Rental request submitted successfully', rental);
  } catch (err) {
    next(err);
  }
};

export const myRentals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as AuthRequest).user?.id;
    if (!tenantId) throw new AppError('Unauthorized', 401);

    const rentals = await getTenantRentals(tenantId);
    sendSuccess(res, 200, 'Rental requests fetched successfully', rentals);
  } catch (err) {
    next(err);
  }
};

export const getRental = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const rental = await getRentalById(req.params['id'] as string, userId);
    sendSuccess(res, 200, 'Rental request fetched successfully', rental);
  } catch (err) {
    next(err);
  }
};

export const landlordRentals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = (req as AuthRequest).user?.id;
    if (!landlordId) throw new AppError('Unauthorized', 401);

    const rentals = await getLandlordRentals(landlordId);
    sendSuccess(res, 200, 'Rental requests fetched successfully', rentals);
  } catch (err) {
    next(err);
  }
};

export const markCompleted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = (req as AuthRequest).user?.id;
    if (!landlordId) throw new AppError('Unauthorized', 401);

    const rental = await completeRental(req.params['id'] as string, landlordId);
    sendSuccess(res, 200, 'Rental marked as completed', rental);
  } catch (err) {
    next(err);
  }
};

export const handleRentalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landlordId = (req as AuthRequest).user?.id;
    if (!landlordId) throw new AppError('Unauthorized', 401);

    const { status } = req.body as { status?: string };
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError('status must be APPROVED or REJECTED', 400);
    }

    const rental = await updateRentalStatus(
      req.params['id'] as string,
      landlordId,
      status as 'APPROVED' | 'REJECTED'
    );
    sendSuccess(res, 200, `Rental request ${status.toLowerCase()} successfully`, rental);
  } catch (err) {
    next(err);
  }
};
