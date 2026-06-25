import express from 'express';
import { createFolder, getFoldersByWing, deleteFolder } from '../controller/folderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createFolder);
router.get('/wing/:wing', getFoldersByWing);
router.delete('/:id', auth, deleteFolder);

export default router;
