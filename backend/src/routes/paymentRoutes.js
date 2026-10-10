import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';

const router = Router();

// Create Razorpay order (paise, test mode)
router.post('/razorpay/create-order', requireAuth, createRazorpayOrder);

// Verify Razorpay payment signature & create order
router.post('/razorpay/verify', requireAuth, verifyRazorpayPayment);

export default router;
