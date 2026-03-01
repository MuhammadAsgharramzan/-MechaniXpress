import express from 'express';
import { initiateBookingPayment, paymentCallback } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Authed route to start paying
router.post('/initiate', authenticate, initiateBookingPayment);

// Public route for Webhooks/IPN
router.post('/callback', paymentCallback);

export default router;
