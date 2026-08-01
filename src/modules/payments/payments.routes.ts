import { Router } from 'express';
import { createPayment, stripeWebhook, myPayments, getPayment, verifyPayment } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Stripe webhook must use raw body — mounted separately in app.ts
router.post('/create', authenticate, authorize(Role.TENANT), createPayment);
router.post('/verify', verifyPayment);
router.get('/', authenticate, authorize(Role.TENANT), myPayments);
router.get('/:id', authenticate, authorize(Role.TENANT), getPayment);

export { stripeWebhook };
export default router;
