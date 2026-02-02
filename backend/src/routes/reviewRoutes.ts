import express from 'express';
import { createReview, getMechanicReviews } from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public read access for reviews? Or authenticated? Let's say public for now so anyone can see reviews.
router.get('/mechanic/:mechanicId', getMechanicReviews);

// Customer only write access
router.post('/', authenticate, authorize(['CUSTOMER']), createReview);

export default router;
