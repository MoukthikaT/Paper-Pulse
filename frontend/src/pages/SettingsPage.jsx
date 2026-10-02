import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Settings, Moon, Sun, Volume2, VolumeX, Shield, 
  RotateCcw, Database, CheckCircle2, AlertTriangle, X 
} from 'lucide-react';
import { useTheme, THEMES, THEME_CONFIGS } from '../context/ThemeContext';
import { sounds } from '../utils/soundEffects';
import { API_BASE } from '../config/api';

const SettingsPage = () => {
  const { theme, setTheme, themeConfigs, soundEnabled, toggleSound } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetSimulator = async () => {
    setResetting(true);
    try {
      await axios.post(`${API_BASE}/wallet/reset`, { initialAmount: 100000 });
      sounds.playSuccess();
      setResetSuccess(true);
      setShowResetConfirm(false);
      setTimeout(() => setResetSuccess(false), 3500);
    } catch (err) {
      sounds.playError();
      alert('Failed to reset simulation wallet.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem', width: '100%', maxWidth: '800px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Platform Settings & Simulation Preferences</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
            Customize visual themes, audio feedback, simulation safety profiles & manage virtual capital
          </p>
        </div>
      </div>

      {resetSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
          style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <CheckCircle2 size={18} />
          <strong>Simulation wallet successfully reset to ₹1,00,000!</strong>
        </motion.div>
      )}

      {/* Visual Theme Selection */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700 }}>
          Visual Theme & Interface
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Choose your preferred financial trading interface aesthetic.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(themeConfigs).map(([key, config]) => {
            const isSelected = theme === key;
            return (
              <div
                key={key}
                onClick={() => { setTheme(key); sounds.playTick(); }}
                className="glass-card"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${config.accent}` : '1px solid var(--glass-border)',
                  background: isSelected ? `${config.accent}15` : 'var(--glass-bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: config.accent }} />
                  {isSelected && <CheckCircle2 size={15} color={config.accent} />}
                </div>
                <strong style={{ fontSize: '0.9rem' }}>{config.name}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{config.badge}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Effects */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Synthesizer Audio Feedback</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Web Audio API sound cues for trade executions, tick clicks, and quiz feedback.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              className="btn-outline"
              onClick={() => { sounds.playSuccess(); }}
              style={{ fontSize: '0.78rem' }}
            >
              Test Sound
            </button>
            <button 
              className={soundEnabled ? 'btn-primary' : 'btn-outline'}
              onClick={toggleSound}
              style={{ fontSize: '0.82rem' }}
            >
              {soundEnabled ? <><Volume2 size={15} /> Enabled</> : <><VolumeX size={15} /> Muted</>}
            </button>
          </div>
        </div>
      </div>

      {/* Data Mode & Environment */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
          Data Integrity & Honesty
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Information transparency on market feeds and machine learning parameters.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Market Environment</span>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
              Historical NSE CSV Feeds
            </div>
          </div>
          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AI Classifier Service</span>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-pink)', marginTop: '0.15rem' }}>
              Python FastAPI / Scikit-Learn
            </div>
          </div>
        </div>
      </div>

      {/* Reset Simulation Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-red)' }}>
              Reset Simulation Environment
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Reset your virtual cash balance back to the starting ₹1,00,000 capital.
            </p>
          </div>

          <button 
            className="btn-danger"
            onClick={() => setShowResetConfirm(true)}
            style={{ fontSize: '0.82rem' }}
          >
            <RotateCcw size={14} /> Reset Virtual Wallet
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
            <motion.div 
              className="modal-content"
              style={{ maxWidth: '440px', padding: '1.5rem', background: 'var(--bg-surface)' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-red)', marginBottom: '0.85rem' }}>
                <AlertTriangle size={22} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Confirm Wallet Reset?</h3>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                This will reset your simulated wallet balance back to <strong>₹1,00,000</strong>. This action is irreversible.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn-outline" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleResetSimulator} disabled={resetting}>
                  {resetting ? 'Resetting...' : 'Yes, Reset Wallet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
