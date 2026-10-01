const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply JWT Authentication middleware to all wallet endpoints
router.use(authMiddleware);

// GET /api/wallet - Get authenticated user's wallet balance
router.get('/', (req, res, next) => walletController.getWalletBalance(req, res, next));

// POST /api/wallet/reset - Reset authenticated user's wallet balance (for testing/dev)
router.post('/reset', (req, res, next) => walletController.resetWalletBalance(req, res, next));

// POST /api/wallet/add-funds - Add virtual capital or rewards to user's wallet
router.post('/add-funds', (req, res, next) => walletController.addFunds(req, res, next));

module.exports = router;
