import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido. Solo: jpg, jpeg, png, gif, webp, svg'));
    }
  },
});

router.post(
  '/upload',
  authenticate,
  requireAdmin,
  (req: Request, res: Response): void => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ success: false, error: 'La imagen excede el tamaño máximo de 10MB' });
            return;
          }
          res.status(400).json({ success: false, error: err.message });
          return;
        }
        res.status(400).json({ success: false, error: err.message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, error: 'No se envió ningún archivo' });
        return;
      }

      const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      res.json({ success: true, data: { url } });
    });
  },
);

export default router;
