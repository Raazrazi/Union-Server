import express from 'express';
import { getAllWings, getWingByName, updateWingQuota, createWing } from '../controller/wingController.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllWings);
router.get('/:name', getWingByName);
router.put('/:name/quota', auth, checkRole(['super_admin']), updateWingQuota);
router.post('/', auth, checkRole(['super_admin']), createWing);

export default router;
