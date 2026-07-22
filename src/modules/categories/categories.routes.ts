import { Router } from 'express';
import { getCategories, addCategory, editCategory, removeCategory } from './categories.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorize(Role.ADMIN), addCategory);
router.put('/:id', authenticate, authorize(Role.ADMIN), editCategory);
router.delete('/:id', authenticate, authorize(Role.ADMIN), removeCategory);

export default router;
