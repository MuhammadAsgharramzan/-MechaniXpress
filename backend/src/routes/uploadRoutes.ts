import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Upload single file
router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
