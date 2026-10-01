const mongoose = require('mongoose');
const walletService = require('./walletService');
const portfolioService = require('./portfolioService');
const tradeHistoryService = require('./tradeHistoryService');
const { isDbConnected } = require('../config/db');

class TradingService {
  /**
   * Unified Trade Execution Engine for BUY, SELL, and HOLD actions.
   * Handles both MANUAL and AUTOMATIC paper trades with atomic transaction support.
   * 
   * @param {Object} tradePayload
   */
  async executeTrade({
    userId = 'default_user',
    symbol,
    action,
    quantity,
    price,
    signal,
    tradeType = 'MANUAL',
    journalNotes = '',
    strategyTag = 'Discretionary',
    confidenceLevel = 3,
    expectedOutcome = 'Bullish',
    reflectionNotes = '',
    aiConfidence = 0,
    aiSignal = ''
  }) {
    // 1. Input Normalization & Sanity Validation
    if (!action || !['BUY', 'SELL', 'HOLD'].includes(action.toUpperCase())) {
      const error = new Error('Invalid trade action. Allowed actions: BUY, SELL, HOLD');
      error.code = 'INVALID_ACTION';
      throw error;
    }

    const normalizedAction = action.toUpperCase();

    // 2. Handle HOLD Logic
    if (normalizedAction === 'HOLD') {
      const currentWalletBalance = await walletService.getBalance(userId);
      const currentHolding = symbol ? await portfolioService.getHolding(userId, symbol) : null;

      return {
        executed: false,
        action: 'HOLD',
        message: 'HOLD signal processed. No changes executed on wallet or portfolio.',
        trade: null,
        walletBalance: currentWalletBalance,
        holding: currentHolding
      };
    }

    // 3. Validation for BUY and SELL
    if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
      const error = new Error('Valid stock symbol is required');
      error.code = 'INVALID_SYMBOL';
      throw error;
    }

    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0 || !Number.isInteger(numQuantity)) {
      const error = new Error('Quantity must be a positive integer');
      error.code = 'INVALID_QUANTITY';
      throw error;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      const error = new Error('Price must be a positive number');
      error.code = 'INVALID_PRICE';
      throw error;
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const totalValue = Math.round(numQuantity * numPrice * 100) / 100;
    const tradeSignal = signal || normalizedAction;

    let session = null;
    let useTransaction = false;

    if (isDbConnected()) {
      const topologyType = mongoose.connection.client?.topology?.description?.type;
      const supportsTransactions = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';

      if (supportsTransactions) {
        try {
          session = await mongoose.startSession();
          session.startTransaction();
          useTransaction = true;
        } catch (err) {
          if (session) {
            try { await session.endSession(); } catch (e) {}
            session = null;
          }
          useTransaction = false;
        }
      }
    }

    const sessionOptions = useTransaction && session ? { session } : {};

    let walletModified = 0; // positive if deducted, negative if added
    let previousHoldingSnapshot = null;
    let holdingModified = false;

    try {
      // 4. BUY Logic
      if (normalizedAction === 'BUY') {
        const hasBalance = await walletService.hasSufficientBalance(userId, totalValue, sessionOptions);
        if (!hasBalance) {
          const error = new Error(`Insufficient wallet balance. Required: ₹${totalValue}`);
          error.code = 'INSUFFICIENT_BALANCE';
          throw error;
        }

        // Capture previous holding snapshot for non-transactional rollback compensation
        const prev = await portfolioService.getHolding(userId, cleanSymbol, sessionOptions);
        previousHoldingSnapshot = prev ? { quantity: prev.quantity, averagePurchasePrice: prev.averagePurchasePrice } : null;

        // Deduct from wallet
        const updatedWalletBalance = await walletService.deduct(userId, totalValue, sessionOptions);
        walletModified = totalValue;

        // Add/update holding in portfolio
        const updatedHolding = await portfolioService.updateHoldingOnBuy(userId, cleanSymbol, numQuantity, numPrice, sessionOptions);
        holdingModified = true;

        // Create Trade History Record
        const tradeRecord = await tradeHistoryService.createTradeRecord({
          userId,
          symbol: cleanSymbol,
          action: 'BUY',
          quantity: numQuantity,
          price: numPrice,
          totalValue,
          signal: tradeSignal,
          tradeType,
          profitLoss: 0,
          journalNotes,
          strategyTag,
          confidenceLevel,
          expectedOutcome,
          reflectionNotes,
          aiConfidence,
          aiSignal
        }, sessionOptions);

        if (useTransaction && session) {
          await session.commitTransaction();
        }

        return {
          executed: true,
          action: 'BUY',
          tradeType,
          symbol: cleanSymbol,
          quantity: numQuantity,
          price: numPrice,
          totalValue,
          walletBalance: updatedWalletBalance,
          portfolioHolding: updatedHolding,
          trade: tradeRecord
        };
      }

      // 5. SELL Logic
      if (normalizedAction === 'SELL') {
        const existingHolding = await portfolioService.getHolding(userId, cleanSymbol, sessionOptions);
        if (!existingHolding || existingHolding.quantity < numQuantity) {
          const ownedQty = existingHolding ? existingHolding.quantity : 0;
          const error = new Error(`Insufficient shares to sell. Owned: ${ownedQty}, Requested: ${numQuantity}`);
          error.code = 'INSUFFICIENT_HOLDINGS';
          throw error;
        }

        previousHoldingSnapshot = { quantity: existingHolding.quantity, averagePurchasePrice: existingHolding.averagePurchasePrice };

        // Calculate realized P/L and update portfolio
        const { holding: updatedHolding, realizedPL } = await portfolioService.updateHoldingOnSell(
          userId,
          cleanSymbol,
          numQuantity,
          numPrice,
          sessionOptions
        );
        holdingModified = true;

        // Add sale proceeds to wallet
        const updatedWalletBalance = await walletService.add(userId, totalValue, sessionOptions);
        walletModified = -totalValue;

        // Create Trade History Record
        const tradeRecord = await tradeHistoryService.createTradeRecord({
          userId,
          symbol: cleanSymbol,
          action: 'SELL',
          quantity: numQuantity,
          price: numPrice,
          totalValue,
          signal: tradeSignal,
          tradeType,
          profitLoss: realizedPL,
          journalNotes,
          strategyTag,
          confidenceLevel,
          expectedOutcome,
          reflectionNotes,
          aiConfidence,
          aiSignal
        }, sessionOptions);

        if (useTransaction && session) {
          await session.commitTransaction();
        }

        return {
          executed: true,
          action: 'SELL',
          tradeType,
          symbol: cleanSymbol,
          quantity: numQuantity,
          price: numPrice,
          totalValue,
          realizedProfitLoss: realizedPL,
          walletBalance: updatedWalletBalance,
          portfolioHolding: updatedHolding,
          trade: tradeRecord
        };
      }
    } catch (error) {
      if (useTransaction && session) {
        try {
          await session.abortTransaction();
        } catch (abortErr) {
          console.warn(`[TradingService] Failed to abort transaction: ${abortErr.message}`);
        }
      } else {
        // Compensating rollback for standalone/in-memory environments
        try {
          if (walletModified > 0) {
            // Restore deducted funds
            await walletService.add(userId, walletModified);
          } else if (walletModified < 0) {
            // Revert credited sale proceeds
            await walletService.deduct(userId, Math.abs(walletModified));
          }

          if (holdingModified && previousHoldingSnapshot) {
            if (isDbConnected()) {
              const Portfolio = require('../models/Portfolio');
              await Portfolio.findOneAndUpdate(
                { userId, symbol: cleanSymbol },
                {
                  quantity: previousHoldingSnapshot.quantity,
                  averagePurchasePrice: previousHoldingSnapshot.averagePurchasePrice,
                  totalInvested: Math.round(previousHoldingSnapshot.quantity * previousHoldingSnapshot.averagePurchasePrice * 100) / 100
                }
              );
            } else {
              portfolioService.inMemoryPortfolios.set(`${userId}_${cleanSymbol}`, {
                id: `hld_${userId}_${cleanSymbol}`,
                userId,
                symbol: cleanSymbol,
                quantity: previousHoldingSnapshot.quantity,
                averagePurchasePrice: previousHoldingSnapshot.averagePurchasePrice,
                totalInvested: Math.round(previousHoldingSnapshot.quantity * previousHoldingSnapshot.averagePurchasePrice * 100) / 100
              });
            }
          } else if (holdingModified && !previousHoldingSnapshot) {
            // New holding created that should be deleted
            if (isDbConnected()) {
              const Portfolio = require('../models/Portfolio');
              await Portfolio.deleteOne({ userId, symbol: cleanSymbol });
            } else {
              portfolioService.inMemoryPortfolios.delete(`${userId}_${cleanSymbol}`);
            }
          }
        } catch (compensationErr) {
          console.error(`[TradingService] Compensation error during trade rollback: ${compensationErr.message}`);
        }
      }
      throw error;
    } finally {
      if (session) {
        try {
          session.endSession();
        } catch (e) {}
      }
    }
  }
}

module.exports = new TradingService();
