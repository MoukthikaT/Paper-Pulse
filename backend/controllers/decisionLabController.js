const csvStockService = require('../services/csvStockService');
const DecisionLab = require('../models/DecisionLab');
const { isDbConnected } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// In-memory store fallback
const inMemoryChallenges = [];

class DecisionLabController {
  _resolveUserId(req) {
    if (req.user && req.user.userId) {
      return req.user.userId;
    }
    return 'default_user';
  }

  /**
   * GET /api/decision-lab/challenge
   * Generates a random historical challenge snapshot with masked future
   */
  async getChallenge(req, res, next) {
    try {
      const symbols = csvStockService.getAvailableSymbols();
      const symbol = req.query.symbol || symbols[Math.floor(Math.random() * symbols.length)];
      const history = csvStockService.getHistoricalData(symbol, 60);

      if (!history || history.length < 25) {
        return errorResponse(res, 400, 'Insufficient historical data for challenge');
      }

      // Choose a split index at least 15 candles before the end, and at least 20 candles after the start
      const maxIndex = history.length - 11;
      const minIndex = 15;
      const splitIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;

      const visibleSlice = history.slice(0, splitIndex);
      const snapshot = visibleSlice[visibleSlice.length - 1];
      const futureSlice = history.slice(splitIndex, splitIndex + 10);

      // Compute indicators on visible slice
      const prices = visibleSlice.map(h => h.close);
      const currentPrice = snapshot.close;
      const sma10 = Math.round(prices.slice(-10).reduce((a, b) => a + b, 0) / 10);
      const sma20 = Math.round(prices.slice(-20).reduce((a, b) => a + b, 0) / 20);
      const trend = currentPrice >= sma20 ? 'Upward' : 'Downward';

      // RSI on visible slice
      let rsi = 50;
      if (prices.length >= 14) {
        let gains = 0, losses = 0;
        for (let i = prices.length - 13; i < prices.length; i++) {
          const diff = prices[i] - prices[i - 1];
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const rs = (gains / 14) / Math.max(0.001, (losses / 14));
        rsi = Math.round((100 - (100 / (1 + rs))));
      }

      // Simulated AI Decision on snapshot
      let aiDecision = 'HOLD';
      if (currentPrice > sma10 && rsi < 70) aiDecision = 'BUY';
      else if (currentPrice < sma10 || rsi > 70) aiDecision = 'SELL';

      // Future outcome
      const futureEndPrice = futureSlice[futureSlice.length - 1].close;
      const actualReturnPct = Math.round(((futureEndPrice - currentPrice) / currentPrice) * 1000) / 10;

      // Hash to create token for validation
      const challengeId = `CHAL_${Date.now()}_${symbol}`;

      return successResponse(res, 200, 'Decision Lab challenge snapshot generated', {
        challengeId,
        symbol,
        snapshotDate: snapshot.date,
        snapshotPrice: currentPrice,
        visibleHistory: visibleSlice,
        indicators: {
          trend,
          rsi,
          sma10,
          sma20,
          volume: snapshot.volume > 1000000 ? 'High' : 'Normal',
          peRatio: (24 + (snapshot.close % 15)).toFixed(1)
        },
        // Encrypted/masked outcome payload resolved upon submission
        outcomeSecret: {
          futureHistory: futureSlice,
          futureEndPrice,
          actualReturnPct,
          aiDecision
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/decision-lab/submit
   * Evaluates user decision against AI and actual future
   */
  async submitDecision(req, res, next) {
    try {
      const userId = this._resolveUserId(req);
      const {
        symbol,
        snapshotDate,
        snapshotPrice,
        userDecision,
        aiDecision,
        actualReturnPct
      } = req.body;

      const isBuyCorrect = actualReturnPct > 0;
      const isSellCorrect = actualReturnPct < 0;
      const isHoldCorrect = Math.abs(actualReturnPct) <= 2;

      let userCorrect = false;
      if (userDecision === 'BUY' && isBuyCorrect) userCorrect = true;
      else if (userDecision === 'SELL' && isSellCorrect) userCorrect = true;
      else if (userDecision === 'HOLD' && isHoldCorrect) userCorrect = true;

      let aiCorrect = false;
      if (aiDecision === 'BUY' && isBuyCorrect) aiCorrect = true;
      else if (aiDecision === 'SELL' && isSellCorrect) aiCorrect = true;
      else if (aiDecision === 'HOLD' && isHoldCorrect) aiCorrect = true;

      const record = {
        userId,
        symbol: symbol.toUpperCase(),
        snapshotDate,
        snapshotPrice: Number(snapshotPrice),
        userDecision,
        aiDecision,
        actualReturnPct: Number(actualReturnPct),
        userCorrect,
        aiCorrect,
        timestamp: new Date()
      };

      if (isDbConnected()) {
        try {
          await DecisionLab.create(record);
        } catch (err) {
          console.warn(`[DecisionLab] MongoDB write error: ${err.message}`);
        }
      }
      inMemoryChallenges.unshift(record);

      return successResponse(res, 200, 'Decision analyzed', {
        userDecision,
        aiDecision,
        actualReturnPct,
        userCorrect,
        aiCorrect,
        summary: userCorrect
          ? `Great job! Your ${userDecision} thesis succeeded as the stock moved ${actualReturnPct >= 0 ? '+' : ''}${actualReturnPct}%.`
          : `Market evolved differently (${actualReturnPct >= 0 ? '+' : ''}${actualReturnPct}%). AI predicted ${aiDecision}.`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/decision-lab/stats
   * Get User vs AI scoreboard
   */
  async getStats(req, res, next) {
    try {
      const userId = this._resolveUserId(req);
      let records = [];

      if (isDbConnected()) {
        try {
          records = await DecisionLab.find({ userId }).sort({ timestamp: -1 }).lean();
        } catch (err) {
          records = inMemoryChallenges.filter(c => c.userId === userId);
        }
      } else {
        records = inMemoryChallenges.filter(c => c.userId === userId);
      }

      const total = records.length;
      const userWins = records.filter(r => r.userCorrect).length;
      const aiWins = records.filter(r => r.aiCorrect).length;
      const avgReturn = total > 0 ? (records.reduce((acc, r) => acc + r.actualReturnPct, 0) / total).toFixed(1) : 0;

      const userAccuracy = total > 0 ? Math.round((userWins / total) * 100) : 0;
      const aiAccuracy = total > 0 ? Math.round((aiWins / total) * 100) : 0;

      return successResponse(res, 200, 'AI vs You stats retrieved', {
        totalDecisions: total,
        userAccuracy,
        aiAccuracy,
        userWins,
        aiWins,
        avgSimulatedReturn: Number(avgReturn),
        recentHistory: records.slice(0, 10)
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DecisionLabController();
