const walletService = require('../services/walletService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class WalletController {
  /**
   * GET /api/wallet
   */
  async getWalletBalance(req, res, next) {
    try {
      const userId = req.user.userId;
      const balance = await walletService.getBalance(userId);
      return successResponse(res, 200, 'Wallet balance retrieved successfully', { balance });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/wallet/reset
   */
  async resetWalletBalance(req, res, next) {
    try {
      const userId = req.user.userId;
      const initialAmount = Number(req.body.initialAmount) || 100000;
      const balance = await walletService.resetBalance(userId, initialAmount);
      return successResponse(res, 200, `Wallet balance successfully reset to ₹${initialAmount}`, { balance });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/wallet/add-funds
   */
  async addFunds(req, res, next) {
    try {
      const userId = req.user.userId;
      const amount = Number(req.body.amount) || 0;
      if (amount <= 0) {
        return errorResponse(res, 400, 'Deposit amount must be greater than zero');
      }
      const balance = await walletService.add(userId, amount);
      return successResponse(res, 200, `Successfully added ₹${amount.toLocaleString('en-IN')} to virtual wallet!`, { balance });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
