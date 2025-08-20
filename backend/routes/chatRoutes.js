import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { myChats, createPrivate, createGroup } from '../controllers/chatController.js';

const router = Router();
router.get('/', protect, myChats);
router.post('/private', protect, createPrivate);
router.post('/group', protect, createGroup);
export default router;
