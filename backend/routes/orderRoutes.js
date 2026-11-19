const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { orderValidationRules } = require('../middleware/validate');

// All order routes require authentication
router.use(requireAuth);

router.post('/', orderValidationRules, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin only order routes
router.get('/', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
