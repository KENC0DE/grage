const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Generate JWT token and send response with user data
 * @param {object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 * @param {string} message - Optional message
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Generate token
  const token = generateToken(user._id);

  // Remove password from user object
  const userResponse = user.toJSON ? user.toJSON() : user;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: userResponse
    }
  });
};

module.exports = {
  generateToken,
  sendTokenResponse
};
