import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlusCircle, RotateCcw, Wallet, Sparkles, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';
import { launchConfetti } from '../utils/confetti';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const WalletTopupModal = ({ isOpen, onClose, currentBalance, onUpdate }) => {
  const [amount, setAmount] = useState(25000);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleAddFunds = async (addAmount) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await axios.post(`${API_BASE}/wallet/add-funds`, { amount: addAmount });
      sounds.playSuccess();
      launchConfetti(1800);
      setStatusMsg({ type: 'success', text: res.data.message || `Added ₹${addAmount.toLocaleString('en-IN')}!` });
      if (onUpdate) onUpdate();
    } catch (err) {
      sounds.playError();
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add virtual funds' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset wallet balance to default ₹1,00,000?')) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      await axios.post(`${API_BASE}/wallet/reset`, { initialAmount: 100000 });
      sounds.playTick();
      setStatusMsg({ type: 'success', text: 'Wallet successfully reset to ₹1,00,000!' });
      if (onUpdate) onUpdate();
    } catch (err) {
      sounds.playError();
      setStatusMsg({ type: 'error', text: 'Failed to reset wallet' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content glass-panel"
          style={{ padding: '1.75rem', maxWidth: '480px' }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(236,72,153,0.15)', borderRadius: '0.5rem' }}>
                <Wallet size={20} color="var(--accent-pink)" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Virtual Capital Manager</h3>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1rem', borderRadius: '0.65rem', border: '1px solid var(--glass-border)', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Virtual Balance</span>
            <h2 className="mono-font" style={{ margin: '0.2rem 0 0 0', fontSize: '1.7rem', color: 'var(--accent-green)' }}>
              ₹{currentBalance?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h2>
          </div>

          {statusMsg && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              fontSize: '0.85rem',
              background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: statusMsg.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'
            }}>
              <CheckCircle2 size={16} />
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Quick Virtual Deposit (Faucet)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {[10000, 25000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  className="btn-outline mono-font"
                  style={{ fontSize: '0.82rem', padding: '0.5rem' }}
                  onClick={() => setAmount(val)}
                >
                  +₹{(val / 1000)}k
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number"
                className="input-field mono-font"
                style={{ flex: 1 }}
                value={amount}
                onChange={(e) => setAmount(Math.max(1000, Number(e.target.value) || 0))}
                min="1000"
                step="1000"
              />
              <button 
                className="btn-primary" 
                onClick={() => handleAddFunds(amount)}
                disabled={loading}
              >
                <PlusCircle size={16} /> Deposit
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Need a clean slate?</span>
            <button 
              className="btn-outline" 
              onClick={handleReset}
              disabled={loading}
              style={{ fontSize: '0.82rem', color: 'var(--accent-red)' }}
            >
              <RotateCcw size={14} /> Reset to ₹1,00,000
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalletTopupModal;
