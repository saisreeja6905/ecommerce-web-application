const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { productValidationRules } = require('../middleware/validate');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/:identifier', getProductByIdOrSlug);
router.get('/:id/related', getRelatedProducts);

router.post('/', requireAuth, requireAdmin, productValidationRules, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

module.exports = router;
