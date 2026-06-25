import express from 'express';
import { getSystemOverview, getWingAnalytics } from '../controller/analyticsController.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/system', auth, checkRole(['super_admin']), getSystemOverview);
router.get('/wing/:wing', auth, getWingAnalytics);

export default router;
