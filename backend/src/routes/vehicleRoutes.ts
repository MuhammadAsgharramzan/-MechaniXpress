import express from 'express';
import { addVehicle, getVehicles, deleteVehicle } from '../controllers/vehicleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // All routes require auth

router.post('/', authorize(['CUSTOMER']), addVehicle);
router.get('/', authorize(['CUSTOMER']), getVehicles);
router.delete('/:id', authorize(['CUSTOMER']), deleteVehicle);

export default router;
