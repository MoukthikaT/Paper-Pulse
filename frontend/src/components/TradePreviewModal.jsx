import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle2, ShieldAlert, Sparkles, AlertCircle, 
  ArrowRight, BookOpen, Star 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const STRATEGIES = ['Momentum', 'Trend', 'Fundamental', 'AI Signal', 'Experiment', 'Discretionary'];

const TradePreviewModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  tradeDetails, 
  walletBalance = 100000,
  loading = false 
}) => {
  const [journalNotes, setJournalNotes] = useState('');
  const [strategyTag, setStrategyTag] = useState('AI Signal');
  const [confidenceLevel, setConfidenceLevel] = useState(4);
  const [expectedOutcome, setExpectedOutcome] = useState('Bullish');

  if (!isOpen || !tradeDetails) return null;

  const { symbol, action, quantity, price, signal, aiConfidence } = tradeDetails;
  const totalCost = Math.round(quantity * price * 100) / 100;
  const remainingCash = action === 'BUY' ? walletBalance - totalCost : walletBalance + totalCost;
  const isAffordable = action === 'SELL' || walletBalance >= totalCost;

  const handleExecute = () => {
    onConfirm({
      ...tradeDetails,
      journalNotes,
      strategyTag,
      confidenceLevel,
      expectedOutcome
    });
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          style={{ maxWidth: '520px', padding: '1.5rem', background: 'var(--bg-surface)' }}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Simulated Order Ticket
              </span>
              <h3 style={{ margin: '0.1rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>
                Review Paper Trade
              </h3>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>
              <X size={20} />
            </button>
          </div>

          {/* Trade Summary Box */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '1.15rem', 
              marginBottom: '1.25rem',
              borderLeft: action === 'BUY' ? '4px solid var(--accent-green)' : '4px solid var(--accent-red)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={action === 'BUY' ? 'badge-buy' : 'badge-sell'} style={{ fontSize: '0.8rem' }}>
                  {action}
                </span>
                <strong style={{ fontSize: '1.15rem' }}>{quantity} Shares of {symbol}</strong>
              </div>
              <span className="mono-font" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Total Value:</span>
                <div className="mono-font" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Remaining Cash:</span>
                <div className="mono-font" style={{ fontWeight: 700, fontSize: '0.95rem', color: remainingCash >= 0 ? 'var(--text-primary)' : 'var(--accent-red)' }}>
                  ₹{remainingCash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Trade Journal & Reflection Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
              <BookOpen size={15} color="var(--accent-pink)" />
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Trade Journal Thesis (Optional):
              </label>
            </div>

            <textarea
              className="input-field"
              placeholder="Why are you taking this trade? (e.g., Price broke above SMA20 with bullish momentum)"
              value={journalNotes}
              onChange={(e) => setJournalNotes(e.target.value)}
              rows={2}
              style={{ width: '100%', resize: 'none', marginBottom: '0.75rem' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Strategy Tag:
                </label>
                <select 
                  className="input-field" 
                  value={strategyTag}
                  onChange={(e) => setStrategyTag(e.target.value)}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem' }}
                >
                  {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Confidence Level ({confidenceLevel}/5):
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', height: '34px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setConfidenceLevel(star)}
                      style={{ color: star <= confidenceLevel ? 'var(--accent-amber)' : 'rgba(255,255,255,0.2)', padding: '2px' }}
                    >
                      <Star size={18} fill={star <= confidenceLevel ? 'var(--accent-amber)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Risk Disclaimer */}
          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <span>Virtual paper simulation order. No real capital will be transacted.</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button 
              type="button"
              className="btn-outline" 
              onClick={onClose}
              disabled={loading}
              style={{ fontSize: '0.84rem' }}
            >
              Cancel
            </button>

            <button 
              type="button"
              className={action === 'BUY' ? 'btn-success' : 'btn-danger'}
              onClick={handleExecute}
              disabled={loading || (!isAffordable && action === 'BUY')}
              style={{ fontSize: '0.84rem' }}
            >
              {loading ? 'Executing Order...' : `Execute Paper ${action}`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TradePreviewModal;
