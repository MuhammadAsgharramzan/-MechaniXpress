import express from 'express';
import {
    getDashboardStats,
    getAllMechanics,
    approveMechanic,
    rejectMechanic
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes with ADMIN role
router.use(authenticate, authorize(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/mechanics', getAllMechanics);
router.patch('/mechanics/:id/approve', approveMechanic);
router.patch('/mechanics/:id/reject', rejectMechanic);

export default router;
