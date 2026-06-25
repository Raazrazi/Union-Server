import express from 'express';
import { uploadFiles, getFilesByWing, deleteFiles, searchFiles } from '../controller/fileController.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', auth, upload.fields([
  { name: 'files', maxCount: 15 },
  { name: 'report', maxCount: 1 }
]), uploadFiles);
router.get('/wing/:wing', getFilesByWing);
router.post('/delete', auth, deleteFiles);
router.get('/search', searchFiles);

export default router;
