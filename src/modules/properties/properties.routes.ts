import { Router } from 'express';
import { listProperties, getProperty, addProperty, editProperty, removeProperty, myProperties } from './properties.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public
router.get('/', listProperties);
router.get('/:id', getProperty);

// Landlord
router.get('/landlord/my', authenticate, authorize(Role.LANDLORD), myProperties);
router.post('/', authenticate, authorize(Role.LANDLORD), addProperty);
router.put('/:id', authenticate, authorize(Role.LANDLORD), editProperty);
router.delete('/:id', authenticate, authorize(Role.LANDLORD), removeProperty);

export default router;
