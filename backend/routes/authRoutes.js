const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const {
  registerValidationRules,
  loginValidationRules,
} = require('../middleware/validate');

router.post('/register', registerValidationRules, registerUser);
router.post('/login', loginValidationRules, loginUser);
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);
router.put('/change-password', requireAuth, changePassword);

module.exports = router;
