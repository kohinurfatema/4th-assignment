import { Router } from 'express';
import { listUsers, banUnbanUser, listProperties, listRentals } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/users', listUsers);
router.patch('/users/:id', banUnbanUser);
router.get('/properties', listProperties);
router.get('/rentals', listRentals);

export default router;
