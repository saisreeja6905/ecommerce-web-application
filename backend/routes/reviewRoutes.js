const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createProductReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');
const { reviewValidationRules } = require('../middleware/validate');

// Public read access for product reviews
router.get('/product/:productId', getProductReviews);

// Authenticated reviews management
router.post('/product/:productId', requireAuth, reviewValidationRules, createProductReview);
router.put('/:id', requireAuth, updateReview);
router.delete('/:id', requireAuth, deleteReview);

module.exports = router;
