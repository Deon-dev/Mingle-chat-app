import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { upload } from '../utils/multerConfig.js';

const router = Router();
router.get('/:chatId', protect, getMessages);
router.post('/', protect, sendMessage);
router.post('/upload', protect, upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});
export default router;
