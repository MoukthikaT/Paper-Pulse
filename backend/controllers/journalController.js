const tradeHistoryService = require('../services/tradeHistoryService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class JournalController {
  _resolveUserId(req) {
    if (req.user && req.user.userId) {
      return req.user.userId;
    }
    const err = new Error('Authentication is required');
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  /**
   * GET /api/journal
   * Get all journal entries (trades with journal metadata or all trades)
   */
  async getJournalEntries(req, res, next) {
    try {
      const userId = this._resolveUserId(req);
      const trades = await tradeHistoryService.getTradeHistory(userId);
      return successResponse(res, 200, 'Trade journal retrieved successfully', trades);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/journal/:tradeId
   * Update reflection or thesis for a trade
   */
  async updateReflection(req, res, next) {
    try {
      const { tradeId } = req.params;
      const userId = this._resolveUserId(req);
      const { journalNotes, reflectionNotes, strategyTag, confidenceLevel, expectedOutcome } = req.body;

      const updated = await tradeHistoryService.updateTradeJournal(tradeId, userId, {
        journalNotes,
        reflectionNotes,
        strategyTag,
        confidenceLevel,
        expectedOutcome
      });

      if (!updated) {
        return errorResponse(res, 404, 'Trade journal entry not found', 'NOT_FOUND');
      }

      return successResponse(res, 200, 'Trade journal updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/journal/stats
   * Compute breakdown by strategy, win rate by strategy, etc.
   */
  async getJournalStats(req, res, next) {
    try {
      const userId = this._resolveUserId(req);
      const trades = await tradeHistoryService.getTradeHistory(userId);

      const strategyCounts = {};
      let profitableTrades = 0;
      let totalRealizedTrades = 0;

      trades.forEach(t => {
        const strat = t.strategyTag || 'Discretionary';
        strategyCounts[strat] = (strategyCounts[strat] || 0) + 1;
        if (t.action === 'SELL') {
          totalRealizedTrades++;
          if ((t.profitLoss || 0) > 0) profitableTrades++;
        }
      });

      const winRate = totalRealizedTrades > 0 ? Math.round((profitableTrades / totalRealizedTrades) * 100) : 0;

      return successResponse(res, 200, 'Journal statistics retrieved', {
        totalLogged: trades.length,
        strategyBreakdown: strategyCounts,
        realizedTrades: totalRealizedTrades,
        winRate
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JournalController();
