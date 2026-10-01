const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'default_user'
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    enum: ['BUY', 'SELL', 'HOLD']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  signal: {
    type: String,
    default: 'MANUAL'
  },
  tradeType: {
    type: String,
    enum: ['MANUAL', 'AUTOMATIC'],
    default: 'MANUAL'
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  journalNotes: {
    type: String,
    default: ''
  },
  strategyTag: {
    type: String,
    enum: ['Momentum', 'Trend', 'Fundamental', 'AI Signal', 'Experiment', 'Discretionary', 'Other'],
    default: 'Discretionary'
  },
  confidenceLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  expectedOutcome: {
    type: String,
    enum: ['Bullish', 'Neutral', 'Bearish'],
    default: 'Bullish'
  },
  reflectionNotes: {
    type: String,
    default: ''
  },
  aiConfidence: {
    type: Number,
    default: 0
  },
  aiSignal: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Trade || mongoose.model('Trade', tradeSchema);
