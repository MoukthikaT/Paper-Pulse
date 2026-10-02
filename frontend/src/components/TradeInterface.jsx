import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { TrendingUp, CheckCircle2, AlertCircle, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { launchConfetti } from '../utils/confetti';
import { API_BASE } from '../config/api';

const TradeInterface = ({ stockData, walletBalance = 100000, onTrade, onOpenPreview, suggestedQuantity = null }) => {
  const [quantity, setQuantity] = useState(suggestedQuantity || 10);
  const [loading, setLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState(null);

  useEffect(() => {
    if (suggestedQuantity && suggestedQuantity > 0) {
      setQuantity(suggestedQuantity);
    }
  }, [suggestedQuantity]);

  const price = stockData?.currentPrice || 1000;
  const signal = stockData?.analysis?.signal || 'HOLD';
  const confidence = stockData?.analysis?.confidence || 0.75;
  const reasoning = stockData?.analysis?.reasoning || 'Analyzing market patterns and momentum.';
  const totalCost = (price * (Number(quantity) || 0));

  const handlePercentageAllocation = (pct) => {
    sounds.playTick();
    const availableToSpend = walletBalance * (pct / 100);
    const calculatedQty = Math.max(1, Math.floor(availableToSpend / price));
    setQuantity(calculatedQty);
  };

  const handleInitiateTrade = (action) => {
    sounds.playTick();
    if (action === 'HOLD') {
      handleTrade('HOLD');
      return;
    }

    if (onOpenPreview) {
      onOpenPreview({
        symbol: stockData.symbol,
        action,
        quantity: Number(quantity),
        price,
        signal,
        aiConfidence: confidence
      });
    } else {
      handleTrade(action);
    }
  };

  const handleTrade = (action) => {
    setLoading(true);
    setTradeMessage(null);
    sounds.playTick();

    const tradeQty = action === 'HOLD' ? 0 : Number(quantity);

    axios.post(`${API_BASE}/trades/execute`, {
      symbol: stockData.symbol,
      action: action,
      quantity: tradeQty,
      price: price,
      signal: signal
    })
    .then(res => {
      if (action === 'BUY') {
        sounds.playBuy();
      } else if (action === 'SELL') {
        sounds.playSell();
        launchConfetti(2000);
      } else {
        sounds.playTick();
      }

      setTradeMessage({ type: 'success', text: `Successfully executed ${action} order for ${stockData.symbol}!` });
      if (onTrade) onTrade();
    })
    .catch(err => {
      sounds.playError();
      setTradeMessage({ type: 'error', text: err.response?.data?.message || 'Trade execution failed' });
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const getSignalColors = (sig) => {
    if (sig === 'BUY') return { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--accent-green)', border: 'rgba(16, 185, 129, 0.4)', glow: 'var(--accent-green-glow)' };
    if (sig === 'SELL') return { bg: 'rgba(244, 63, 94, 0.15)', text: 'var(--accent-red)', border: 'rgba(244, 63, 94, 0.4)', glow: 'var(--accent-red-glow)' };
    return { bg: 'rgba(148, 163, 184, 0.15)', text: 'var(--text-secondary)', border: 'rgba(148, 163, 184, 0.3)', glow: 'transparent' };
  };

  const signalStyle = getSignalColors(signal);

  return (
    <div className="glass-panel" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Simulated Execution Terminal
            </span>
            <h3 style={{ margin: '0.1rem 0', fontSize: '1.35rem', fontWeight: 800 }}>{stockData.symbol}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 className="mono-font" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>
              ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Live Spot Quote</span>
          </div>
        </div>
      </div>

      {/* AI Signal Radar & Confidence Box */}
      <div 
        style={{ 
          background: 'rgba(0,0,0,0.35)', 
          padding: '1rem', 
          borderRadius: '0.65rem', 
          border: `1px solid ${signalStyle.border}`,
          boxShadow: `0 0 15px ${signalStyle.glow}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Cpu size={16} color="var(--accent-pink)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>AI Telemetry Engine</span>
          </div>
          <span 
            className="mono-font"
            style={{ 
              color: signalStyle.text,
              fontWeight: 800,
              fontSize: '0.82rem',
              padding: '0.2rem 0.65rem',
              background: signalStyle.bg,
              border: `1px solid ${signalStyle.border}`,
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: signalStyle.text }} />
            {signal} SIGNAL
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {reasoning}
        </p>
      </div>

      {/* Toast Feedback */}
      {tradeMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.65rem 0.85rem', 
            borderRadius: '0.5rem',
            fontSize: '0.82rem',
            background: tradeMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${tradeMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: tradeMessage.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'
          }}
        >
          {tradeMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{tradeMessage.text}</span>
        </motion.div>
      )}

      {/* Quantity & Allocation Controls */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Order Size (Shares)</label>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                className="pill-tag mono-font"
                style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem' }}
                onClick={() => handlePercentageAllocation(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <input 
          type="number" 
          className="input-field mono-font" 
          style={{ width: '100%', fontSize: '0.95rem' }} 
          value={quantity} 
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Estimated Order Value:</span>
          <span className="mono-font" style={{ fontWeight: 700, color: totalCost > walletBalance ? 'var(--accent-red)' : 'var(--text-primary)' }}>
            ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-success" 
          onClick={() => handleInitiateTrade('BUY')}
          disabled={loading || totalCost > walletBalance}
          style={{ width: '100%', height: '44px' }}
        >
          {loading ? 'Executing...' : 'BUY (Review)'}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-danger" 
          onClick={() => handleInitiateTrade('SELL')}
          disabled={loading}
          style={{ width: '100%', height: '44px' }}
        >
          {loading ? 'Executing...' : 'SELL (Review)'}
        </motion.button>
      </div>

      <button 
        className="btn-outline" 
        onClick={() => handleInitiateTrade('HOLD')}
        disabled={loading}
        style={{ width: '100%', fontSize: '0.84rem', padding: '0.5rem' }}
      >
        HOLD (Pass Signal)
      </button>
    </div>
  );
};

export default TradeInterface;
