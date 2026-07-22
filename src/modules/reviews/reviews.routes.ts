import { Router } from 'express';
import { addReview, propertyReviews } from './reviews.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', authenticate, authorize(Role.TENANT), addReview);
router.get('/property/:propertyId', propertyReviews);

export default router;
