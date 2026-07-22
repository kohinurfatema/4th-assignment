import { Request, Response, NextFunction } from 'express';
import { getAllUsers, updateUserStatus, getAllProperties, getAllRentals } from './admin.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/AppError';

export const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    sendSuccess(res, 200, 'Users fetched successfully', users);
  } catch (err) {
    next(err);
  }
};

export const banUnbanUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { isBanned } = req.body as { isBanned?: boolean };

    if (isBanned === undefined) throw new AppError('isBanned (true or false) is required', 400);

    const user = await updateUserStatus(id, isBanned);
    const action = isBanned ? 'banned' : 'unbanned';
    sendSuccess(res, 200, `User ${action} successfully`, user);
  } catch (err) {
    next(err);
  }
};

export const listProperties = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const properties = await getAllProperties();
    sendSuccess(res, 200, 'Properties fetched successfully', properties);
  } catch (err) {
    next(err);
  }
};

export const listRentals = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rentals = await getAllRentals();
    sendSuccess(res, 200, 'Rental requests fetched successfully', rentals);
  } catch (err) {
    next(err);
  }
};
