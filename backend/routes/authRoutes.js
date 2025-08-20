import { Router } from 'express';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { login, register } from '../controllers/authController.js';

const router = Router();
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
export default router;
