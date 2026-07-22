import { Router } from 'express';
import { landlordRentals, handleRentalStatus, markCompleted } from './rentals.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/requests', authenticate, authorize(Role.LANDLORD), landlordRentals);
router.patch('/requests/:id', authenticate, authorize(Role.LANDLORD), handleRentalStatus);
router.patch('/requests/:id/complete', authenticate, authorize(Role.LANDLORD), markCompleted);

export default router;
