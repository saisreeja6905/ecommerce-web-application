const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

// All cart routes require authentication
router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateCartItemQuantity);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
