const { validationResult, body, param, query } = require('express-validator');

// Middleware to evaluate validation chains
const handleValidationResult = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const formattedErrors = result.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed for submitted data',
      errors: formattedErrors,
    });
  }
  next();
};

// User Registration Validation
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters'),
  handleValidationResult,
];

// User Login Validation
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationResult,
];

// Product Creation/Update Validation
const productValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  body('category').notEmpty().withMessage('Category ID is required'),
  body('stockCount')
    .notEmpty()
    .withMessage('Stock inventory count is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer >= 0'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  handleValidationResult,
];

// Review Creation Validation
const reviewValidationRules = [
  body('rating')
    .notEmpty()
    .withMessage('Rating score is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating score must be between 1 and 5'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ max: 100 })
    .withMessage('Review headline cannot exceed 100 characters'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review commentary is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters'),
  handleValidationResult,
];

// Order Placement Validation
const orderValidationRules = [
  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Recipient full name is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Delivery street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('Delivery city is required'),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method selection is required'),
  handleValidationResult,
];

module.exports = {
  handleValidationResult,
  registerValidationRules,
  loginValidationRules,
  productValidationRules,
  reviewValidationRules,
  orderValidationRules,
};
