import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${ts}_${safe}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image uploads are allowed'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const publicUploadsPath = path.resolve(uploadDir);
