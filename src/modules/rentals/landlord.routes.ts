import { Router } from 'express';
import { landlordRentals, handleRentalStatus, markCompleted } from './rentals.controller';
import { addProperty, editProperty, removeProperty, myProperties } from '../properties/properties.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.LANDLORD));

// Rental request management
router.get('/requests', landlordRentals);
router.patch('/requests/:id', handleRentalStatus);
router.patch('/requests/:id/complete', markCompleted);

// Property management under /api/landlord/properties
router.get('/properties', myProperties);
router.post('/properties', addProperty);
router.put('/properties/:id', editProperty);
router.delete('/properties/:id', removeProperty);

export default router;
