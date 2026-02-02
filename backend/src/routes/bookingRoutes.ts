import express from 'express';
import {
    createBooking,
    getCustomerBookings,
    getBookingDetails,
    getAvailableJobs,
    acceptJob,
    updateJobStatus
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer Routes
router.post('/', authenticate, authorize(['CUSTOMER']), createBooking);
router.get('/customer', authenticate, authorize(['CUSTOMER']), getCustomerBookings);

// Mechanic Routes
router.get('/available', authenticate, authorize(['MECHANIC']), getAvailableJobs);
router.patch('/:bookingId/accept', authenticate, authorize(['MECHANIC']), acceptJob);
router.patch('/:bookingId/status', authenticate, authorize(['MECHANIC']), updateJobStatus);

// Shared Routes
router.get('/:id', authenticate, getBookingDetails);

export default router;
