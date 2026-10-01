import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, Square, Shield, Activity, X, CheckCircle2, Zap, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';
import { launchConfetti } from '../utils/confetti';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const AutoPilotModal = ({ isOpen, onClose, stocks, onTradeExecuted }) => {
  const [isActive, setIsActive] = useState(false);
  const [scanIntervalSec, setScanIntervalSec] = useState(15);
  const [riskProfile, setRiskProfile] = useState('Balanced'); // Conservative, Balanced, Aggressive
  const [tradeQuantity, setTradeQuantity] = useState(10);
  const [executedTrades, setExecutedTrades] = useState([]);
  const [stats, setStats] = useState({ scansRun: 0, ordersExecuted: 0 });
  const [currentScanningStock, setCurrentScanningStock] = useState(null);
  const [currentStepStatus, setCurrentStepStatus] = useState('Standby');

  const timerRef = useRef(null);

  const runScanCycle = async () => {
    if (!stocks || stocks.length === 0) return;

    const stockToScan = stocks[Math.floor(Math.random() * stocks.length)];
    setCurrentScanningStock(stockToScan);
    setStats(prev => ({ ...prev, scansRun: prev.scansRun + 1 }));
    setCurrentStepStatus(`Scanning ${stockToScan} momentum telemetry...`);

    try {
      const mlRes = await axios.get(`${API_BASE}/ml/predict/${stockToScan}`);
      const prediction = mlRes.data.data.prediction;
      const confidence = mlRes.data.data.confidence || 0.75;
      const price = mlRes.data.data.price;

      const confidenceThreshold = riskProfile === 'Conservative' ? 0.8 : (riskProfile === 'Balanced' ? 0.65 : 0.5);

      if (prediction === 'HOLD') {
        setCurrentStepStatus(`Evaluated ${stockToScan}: Neutral trend. Position held.`);
      } else if (confidence >= confidenceThreshold) {
        setCurrentStepStatus(`Executing ${prediction} order for ${stockToScan} @ ₹${price}...`);
        
        await axios.post(`${API_BASE}/trades/auto-signal`, {
          symbol: stockToScan,
          action: prediction,
          quantity: tradeQuantity,
          price: price,
          signal: prediction,
          preventDuplicates: true
        });

        if (prediction === 'BUY') {
          sounds.playBuy();
        } else {
          sounds.playSell();
        }

        const newTradeRecord = {
          id: Date.now(),
          symbol: stockToScan,
          action: prediction,
          quantity: tradeQuantity,
          price: price,
          confidence: Math.round(confidence * 100),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        setExecutedTrades(prev => [newTradeRecord, ...prev.slice(0, 10)]);
        setStats(prev => ({ ...prev, ordersExecuted: prev.ordersExecuted + 1 }));
        setCurrentStepStatus(`Order complete: ${prediction} ${tradeQuantity} shares of ${stockToScan}`);
        if (onTradeExecuted) onTradeExecuted();
      } else {
        setCurrentStepStatus(`${stockToScan} signal confidence (${Math.round(confidence * 100)}%) below threshold.`);
      }
    } catch (err) {
      setCurrentStepStatus(`Scan completed. Standing by.`);
    } finally {
      setTimeout(() => setCurrentScanningStock(null), 2000);
    }
  };

  useEffect(() => {
    if (isActive) {
      sounds.playSuccess();
      runScanCycle();
      timerRef.current = setInterval(runScanCycle, scanIntervalSec * 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setCurrentStepStatus('Auto-Pilot Standby');
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, scanIntervalSec, riskProfile]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content glass-panel"
          style={{ padding: '1.75rem', maxWidth: '620px' }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ 
                padding: '0.55rem', 
                background: isActive ? 'rgba(16,185,129,0.2)' : 'rgba(236,72,153,0.15)', 
                borderRadius: '0.6rem',
                border: `1px solid ${isActive ? 'var(--accent-green)' : 'var(--accent-pink)'}`,
                boxShadow: isActive ? '0 0 15px var(--accent-green-glow)' : 'none'
              }}>
                <Bot size={22} color={isActive ? 'var(--accent-green)' : 'var(--accent-pink)'} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>AI Auto-Pilot Trading Bot</h3>
                  <span className={isActive ? 'badge-buy' : 'badge-hold'}>
                    {isActive ? '● AUTONOMOUS' : '○ STANDBY'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Autonomous execution engine based on ML model telemetry and risk thresholds
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          {/* Real-time Status Card */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem', 
              marginBottom: '1.25rem',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              border: isActive ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
              background: isActive ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: isActive ? 'var(--accent-green)' : 'var(--text-muted)', animation: isActive ? 'pulseGlow 1.5s infinite' : 'none' }} />
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block' }}>Engine Status</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{currentStepStatus}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Total Scans</span>
                <strong className="mono-font" style={{ fontSize: '1rem' }}>{stats.scansRun}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Trades</span>
                <strong className="mono-font" style={{ fontSize: '1rem', color: 'var(--accent-pink)' }}>{stats.ordersExecuted}</strong>
              </div>
            </div>
          </div>

          {/* Strategy & Risk Controls */}
          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1.1rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', marginBottom: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} /> Risk Profiles & Auto-Allocation
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Risk Profile</label>
                <select 
                  className="input-field" 
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                  value={riskProfile} 
                  onChange={(e) => setRiskProfile(e.target.value)}
                  disabled={isActive}
                >
                  <option value="Conservative">Conservative (≥80%)</option>
                  <option value="Balanced">Balanced (≥65%)</option>
                  <option value="Aggressive">Aggressive (≥50%)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Scan Frequency</label>
                <select 
                  className="input-field" 
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                  value={scanIntervalSec} 
                  onChange={(e) => setScanIntervalSec(Number(e.target.value))}
                  disabled={isActive}
                >
                  <option value={10}>10 Seconds (Fast)</option>
                  <option value={15}>15 Seconds</option>
                  <option value={30}>30 Seconds</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Shares / Order</label>
                <input 
                  type="number" 
                  className="input-field mono-font" 
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                  value={tradeQuantity} 
                  onChange={(e) => setTradeQuantity(Math.max(1, Number(e.target.value) || 1))}
                  min="1"
                  disabled={isActive}
                />
              </div>
            </div>

            <button
              className={isActive ? 'btn-danger' : 'btn-success'}
              style={{ width: '100%', height: '42px', fontSize: '0.92rem' }}
              onClick={() => setIsActive(prev => !prev)}
            >
              {isActive ? (
                <>
                  <Square size={15} /> Pause Auto-Pilot Bot
                </>
              ) : (
                <>
                  <Play size={15} /> Activate Auto-Pilot Bot
                </>
              )}
            </button>
          </div>

          {/* Clean Visual Executed Trades Activity Timeline (NO RAW LOGS) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={14} color="var(--accent-pink)" /> Auto-Pilot Order Activity
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {executedTrades.length} recent executions
              </span>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {executedTrades.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                  Bot is on standby. When activated, executed trades with AI confidence will appear here.
                </div>
              ) : (
                executedTrades.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: `3px solid ${t.action === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={t.action === 'BUY' ? 'badge-buy' : 'badge-sell'} style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                        {t.action}
                      </span>
                      <div>
                        <strong style={{ fontSize: '0.88rem' }}>{t.symbol}</strong>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>({t.quantity} Shares)</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="mono-font" style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                        ₹{t.price?.toLocaleString('en-IN')}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {t.time} • {t.confidence}% Conf.
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AutoPilotModal;
