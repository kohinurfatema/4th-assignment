import { Router } from 'express';
import { submitRequest, myRentals, getRental } from './rentals.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', authenticate, authorize(Role.TENANT), submitRequest);
router.get('/', authenticate, authorize(Role.TENANT), myRentals);
router.get('/:id', authenticate, getRental);

export default router;
