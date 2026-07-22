import { Request, Response, NextFunction } from 'express';
import { createPaymentSession, handleStripeWebhook, getUserPayments, getPaymentById } from './payments.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth.middleware';

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as AuthRequest).user?.id;
    if (!tenantId) throw new AppError('Unauthorized', 401);

    const { rentalRequestId } = req.body as { rentalRequestId?: string };
    if (!rentalRequestId) throw new AppError('rentalRequestId is required', 400);

    const data = await createPaymentSession(tenantId, rentalRequestId);
    sendSuccess(res, 201, 'Payment session created', data);
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new AppError('Missing stripe signature', 400);
    }

    await handleStripeWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

export const myPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const payments = await getUserPayments(userId);
    sendSuccess(res, 200, 'Payments fetched successfully', payments);
  } catch (err) {
    next(err);
  }
};

export const getPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const payment = await getPaymentById(req.params['id'] as string, userId);
    sendSuccess(res, 200, 'Payment fetched successfully', payment);
  } catch (err) {
    next(err);
  }
};
