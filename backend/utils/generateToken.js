const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the authenticated user
 * @param {string} id - User ID
 * @param {string} role - User Role ('customer' | 'admin')
 * @returns {string} - JWT Token
 */
const generateToken = (id, role = 'customer') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'supersecret_jwt_key_ecommerce_production_2025_secure_token!',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = generateToken;
