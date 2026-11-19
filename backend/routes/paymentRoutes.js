const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPaymentIntent,
  confirmPayment,
  getPaymentByOrder,
  processRefund,
} = require('../controllers/paymentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

// Razorpay Sandbox Routes
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Generic / Card Sandbox Routes
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

// Order Payment Info
router.get('/order/:orderId', getPaymentByOrder);

// Admin Refund
router.post('/:paymentId/refund', requireAdmin, processRefund);

module.exports = router;
