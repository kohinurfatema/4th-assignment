import { Router } from 'express';
import { register, login, me, updateMyProfile } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, updateMyProfile);

export default router;
