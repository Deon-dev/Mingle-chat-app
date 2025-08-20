import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { me, updateMe, searchUsers } from '../controllers/userController.js';

const router = Router();
router.get('/me', protect, me);
router.patch('/me', protect, updateMe);
router.get('/search', protect, searchUsers);
export default router;
