const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Rate limiter for authentication endpoints: 30 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// POST /api/auth/register - Register a new user
router.post('/register', authLimiter, (req, res, next) => authController.register(req, res, next));

// POST /api/auth/login - Authenticate user and return JWT
router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));

// GET /api/auth/me - Retrieve current authenticated user profile
router.get('/me', authMiddleware, (req, res, next) => authController.getProfile(req, res, next));

module.exports = router;
