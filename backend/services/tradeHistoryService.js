const Trade = require('../models/Trade');
const { isDbConnected } = require('../config/db');

class TradeHistoryService {
  constructor() {
    // In-memory trade history backup for offline/mock testing
    this.inMemoryTrades = [];
  }

  /**
   * Save a completed trade record
   */
  async createTradeRecord(tradeData, options = {}) {
    const record = {
      userId: tradeData.userId || 'default_user',
      symbol: tradeData.symbol.toUpperCase(),
      action: tradeData.action.toUpperCase(),
      quantity: Number(tradeData.quantity),
      price: Number(tradeData.price),
      totalValue: Number(tradeData.totalValue),
      signal: tradeData.signal || tradeData.action || 'BUY',
      tradeType: tradeData.tradeType || 'MANUAL',
      profitLoss: Number(tradeData.profitLoss || 0),
      journalNotes: tradeData.journalNotes || '',
      strategyTag: tradeData.strategyTag || 'Discretionary',
      confidenceLevel: Number(tradeData.confidenceLevel) || 3,
      expectedOutcome: tradeData.expectedOutcome || 'Bullish',
      reflectionNotes: tradeData.reflectionNotes || '',
      aiConfidence: Number(tradeData.aiConfidence) || 0,
      aiSignal: tradeData.aiSignal || '',
      timestamp: tradeData.timestamp ? new Date(tradeData.timestamp) : new Date()
    };

    if (isDbConnected()) {
      try {
        const created = await Trade.create([record], { session: options.session || null });
        return created[0].toObject();
      } catch (err) {
        if (options.session) throw err;
        console.warn(`[TradeHistoryService] MongoDB write error (${err.message}). Saving to in-memory store.`);
      }
    }

    // In-memory fallback
    const mockRecord = {
      _id: 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      ...record
    };
    this.inMemoryTrades.unshift(mockRecord);
    return mockRecord;
  }

  /**
   * Update Trade Journal notes or reflection
   */
  async updateTradeJournal(tradeId, userId, { journalNotes, reflectionNotes, strategyTag, confidenceLevel, expectedOutcome }) {
    const updates = {};
    if (journalNotes !== undefined) updates.journalNotes = journalNotes;
    if (reflectionNotes !== undefined) updates.reflectionNotes = reflectionNotes;
    if (strategyTag !== undefined) updates.strategyTag = strategyTag;
    if (confidenceLevel !== undefined) updates.confidenceLevel = Number(confidenceLevel);
    if (expectedOutcome !== undefined) updates.expectedOutcome = expectedOutcome;

    if (isDbConnected()) {
      try {
        const updated = await Trade.findOneAndUpdate(
          { _id: tradeId, userId },
          { $set: updates },
          { new: true }
        ).lean();
        if (updated) return updated;
      } catch (err) {
        console.warn(`[TradeHistoryService] MongoDB update error: ${err.message}`);
      }
    }

    // In-memory fallback
    const index = this.inMemoryTrades.findIndex(t => (t._id === tradeId || String(t._id) === String(tradeId)) && t.userId === userId);
    if (index !== -1) {
      this.inMemoryTrades[index] = { ...this.inMemoryTrades[index], ...updates };
      return this.inMemoryTrades[index];
    }
    return null;
  }

  /**
   * Retrieve trade history for a user, optionally filtered by stock symbol
   */
  async getTradeHistory(userId = 'default_user', symbol = null) {
    if (isDbConnected()) {
      try {
        const query = { userId };
        if (symbol) {
          query.symbol = symbol.toUpperCase();
        }
        return await Trade.find(query).sort({ timestamp: -1 }).lean();
      } catch (err) {
        console.warn(`[TradeHistoryService] MongoDB read error (${err.message}). Querying in-memory store.`);
      }
    }

    // In-memory query
    return this.inMemoryTrades.filter((t) => {
      const matchUser = t.userId === userId;
      const matchSymbol = symbol ? t.symbol === symbol.toUpperCase() : true;
      return matchUser && matchSymbol;
    });
  }

  /**
   * Helper for testing
   */
  clearHistory() {
    this.inMemoryTrades = [];
  }
}

module.exports = new TradeHistoryService();
