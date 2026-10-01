const mongoose = require('mongoose');

const decisionLabSchema = new mongoose.Schema({
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
  snapshotDate: {
    type: String,
    required: true
  },
  snapshotPrice: {
    type: Number,
    required: true
  },
  userDecision: {
    type: String,
    enum: ['BUY', 'HOLD', 'SELL'],
    required: true
  },
  aiDecision: {
    type: String,
    enum: ['BUY', 'HOLD', 'SELL'],
    required: true
  },
  actualReturnPct: {
    type: Number,
    required: true
  },
  userCorrect: {
    type: Boolean,
    required: true
  },
  aiCorrect: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.DecisionLab || mongoose.model('DecisionLab', decisionLabSchema);
